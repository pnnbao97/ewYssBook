// lib/vnpay.ts
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

  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

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

  public createPaymentUrl(params: CreatePaymentUrlParams): string {
    const createDate = new Date().toISOString().replace(/[-T:]/g, '').slice(0, 14);
    const expireDate = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      .toISOString().replace(/[-T:]/g, '').slice(0, 14);

    const vnpParams: VNPayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: params.amount * 100, // VNPay requires amount * 100
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: params.ipAddr,
      vnp_Locale: params.locale || 'vn',
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: params.returnUrl,
      vnp_TxnRef: params.txnRef,
      vnp_ExpireDate: expireDate,
    };

    if (params.bankCode) {
      vnpParams.vnp_BankCode = params.bankCode;
    }

    // Create secure hash
    const secureHash = this.createSecureHash(vnpParams);
    
    // Build query string
    const queryString = Object.keys(vnpParams)
      .map(key => `${key}=${encodeURIComponent(vnpParams[key as keyof VNPayParams]!)}`)
      .join('&');

    return `${this.vnpUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
  }

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
          amount: parseInt(query.vnp_Amount) / 100,
          orderInfo: query.vnp_OrderInfo,
          txnRef: query.vnp_TxnRef,
          responseCode: query.vnp_ResponseCode,
          bankCode: query.vnp_BankCode,
          payDate: query.vnp_PayDate,
        }
      };
    }

    return { isValid: false };
  }
}