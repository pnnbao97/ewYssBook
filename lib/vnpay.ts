import crypto from 'crypto';

interface VNPayParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CreateDate: string;
  vnp_CurrCode: string;
  vnp_IpAddr: string;
  vnp_Locale: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
  vnp_ExpireDate?: string;
  vnp_BankCode?: string;
}

interface CreatePaymentUrlParams {
  amount: number;
  orderInfo: string;
  txnRef: string;
  returnUrl: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
}

export class VNPayService {
  private vnpUrl = process.env.NODE_ENV === 'production' 
    ? 'https://vnpayment.vn/paymentv2/vpcpay.html'
    : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  
  private tmnCode = process.env.VNPAY_TMN_CODE!;
  private hashSecret = process.env.VNPAY_HASH_KEY!;

  /**
   * Sort object và encode theo chuẩn VNPay
   * Đây là phần quan trọng nhất - phải encode trước khi sort
   */
  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    const str = [];
    let key;
    
    // Encode tất cả keys trước khi sort
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    
    // Sort keys đã được encode
    str.sort();
    
    // Tạo sorted object với values đã encode
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    
    return sorted;
  }

  /**
   * Tạo secure hash theo đúng chuẩn VNPay
   */
  private createSecureHash(params: Record<string, any>): string {
    const sortedParams = this.sortObject(params);
    const signData = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha512', this.hashSecret)
      .update(signData)
      .digest('hex');
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  public createPaymentUrl(params: CreatePaymentUrlParams): string {
    const createDate = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    
    // Có thể thêm expire date nếu cần
    // const expireDate = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    //   .toISOString().replace(/[-T:]/g, '').slice(0, 14);

    const vnpParams: VNPayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: (params.amount * 100), // VNPay yêu cầu nhân 100
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: params.ipAddr,
      vnp_Locale: params.locale || 'vn',
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: params.returnUrl,
      vnp_TxnRef: params.txnRef,
      // vnp_ExpireDate: expireDate,
    };

    // Thêm bank code nếu có
    if (params.bankCode) {
      vnpParams.vnp_BankCode = params.bankCode;
    }

    // Tạo secure hash
    const secureHash = this.createSecureHash(vnpParams);
    
    // Tạo query string cho URL cuối cùng
    const queryString = Object.keys(vnpParams)
      .map(key => `${key}=${encodeURIComponent(vnpParams[key as keyof VNPayParams]!)}`)
      .join('&');

    return `${this.vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
  }

  /**
   * Xác thực return URL từ VNPay
   */
  public verifyReturnUrl(query: Record<string, string>): {
    isValid: boolean;
    data?: any;
  } {
    const vnp_SecureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;

    const secureHash = this.createSecureHash(query);
    
    if (secureHash === vnp_SecureHash) {
      return {
        isValid: true,
        data: {
          isSuccess: query.vnp_ResponseCode === '00',
          transactionNo: query.vnp_TransactionNo,
          amount: parseInt(query.vnp_Amount) / 100, // Chia 100 để về số tiền thực
          orderInfo: query.vnp_OrderInfo,
          txnRef: query.vnp_TxnRef,
          responseCode: query.vnp_ResponseCode,
          bankCode: query.vnp_BankCode,
          payDate: query.vnp_PayDate,
          transactionStatus: query.vnp_TransactionStatus,
        }
      };
    }

    return { isValid: false };
  }

  /**
   * Xử lý IPN (Instant Payment Notification) từ VNPay
   */
  public verifyIPN(query: Record<string, string>): {
    isValid: boolean;
    data?: any;
    rspCode: string;
    message: string;
  } {
    try {
      const vnp_SecureHash = query.vnp_SecureHash;
      const params = { ...query };
      delete params.vnp_SecureHash;
      delete params.vnp_SecureHashType;

      const secureHash = this.createSecureHash(params);
      
      if (secureHash !== vnp_SecureHash) {
        return {
          isValid: false,
          rspCode: '97',
          message: 'Invalid signature'
        };
      }

      return {
        isValid: true,
        data: {
          txnRef: query.vnp_TxnRef,
          amount: parseInt(query.vnp_Amount) / 100,
          orderInfo: query.vnp_OrderInfo,
          transactionNo: query.vnp_TransactionNo,
          responseCode: query.vnp_ResponseCode,
          transactionStatus: query.vnp_TransactionStatus,
          bankCode: query.vnp_BankCode,
          payDate: query.vnp_PayDate,
        },
        rspCode: '00',
        message: 'Confirm Success'
      };
      
    } catch (error) {
      return {
        isValid: false,
        rspCode: '99',
        message: 'Unknown error'
      };
    }
  }
}