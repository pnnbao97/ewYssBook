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
  [key: string]: any; // Cho phép thêm các tham số billing/invoice
}

interface CreatePaymentUrlParams {
  amount: number;
  orderInfo: string;
  txnRef: string;
  returnUrl: string;
  ipAddr: string;
  bankCode?: string;
  locale?: string;
  expireDate?: Date; // Thêm tùy chọn expire date
}

export class VNPayService {
  private vnpUrl = process.env.NODE_ENV === 'production' 
    ? 'https://vnpayment.vn/paymentv2/vpcpay.html'
    : 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  
  private tmnCode = process.env.VNPAY_TMN_CODE!;
  private hashSecret = process.env.VNPAY_HASH_KEY!;

  constructor() {
    if (!this.tmnCode || !this.hashSecret) {
      throw new Error('Missing VNPay configuration: VNPAY_TMN_CODE and VNPAY_HASH_KEY are required');
    }
  }

  /**
   * Sort object theo chuẩn VNPay - FIX: Không encode keys khi sort
   * Chỉ encode values, không encode keys
   */
  private sortObject(obj: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    
    // Sort keys theo alphabet (KHÔNG encode keys)
    const sortedKeys = Object.keys(obj).sort();
    
    // Tạo sorted object với values được encode
    for (const key of sortedKeys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
      }
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
   * Format date theo chuẩn VNPay: yyyyMMddHHmmss
   */
  private formatDate(date: Date): string {
    return date.toISOString()
      .replace(/[-T:]/g, '')
      .slice(0, 14);
  }

  /**
   * Validate và sanitize order info theo yêu cầu VNPay
   */
  private sanitizeOrderInfo(orderInfo: string): string {
    // VNPay yêu cầu: Tiếng Việt không dấu và không bao gồm các ký tự đặc biệt
    return orderInfo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
      .replace(/[^a-zA-Z0-9\s]/g, '') // Chỉ giữ chữ, số, space
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .slice(0, 255); // Giới hạn 255 ký tự
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  public createPaymentUrl(params: CreatePaymentUrlParams): string {
    const createDate = this.formatDate(new Date());
    
    // Tạo expire date (mặc định 15 phút nếu không có)
    const expireDate = params.expireDate 
      ? this.formatDate(params.expireDate)
      : this.formatDate(new Date(Date.now() + 15 * 60 * 1000));

    const vnpParams: VNPayParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Amount: params.amount * 100, // VNPay yêu cầu nhân 100
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: params.ipAddr,
      vnp_Locale: params.locale || 'vn',
      vnp_OrderInfo: this.sanitizeOrderInfo(params.orderInfo),
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
    const queryParams = new URLSearchParams();
    Object.keys(vnpParams).forEach(key => {
      const value = vnpParams[key];
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    queryParams.append('vnp_SecureHash', secureHash);

    return `${this.vnpUrl}?${queryParams.toString()}`;
  }

  /**
   * Xác thực return URL từ VNPay
   */
  public verifyReturnUrl(query: Record<string, string>): {
    isValid: boolean;
    data?: any;
    error?: string;
  } {
    try {
      if (!query.vnp_SecureHash) {
        return { isValid: false, error: 'Missing vnp_SecureHash' };
      }

      const vnp_SecureHash = query.vnp_SecureHash;
      const params = { ...query };
      delete params.vnp_SecureHash;

      // Loại bỏ các tham số trống
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      const secureHash = this.createSecureHash(params);
      
      if (secureHash === vnp_SecureHash) {
        return {
          isValid: true,
          data: {
            isSuccess: query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00',
            transactionNo: query.vnp_TransactionNo,
            amount: parseInt(query.vnp_Amount || '0') / 100,
            orderInfo: query.vnp_OrderInfo,
            txnRef: query.vnp_TxnRef,
            responseCode: query.vnp_ResponseCode,
            transactionStatus: query.vnp_TransactionStatus,
            bankCode: query.vnp_BankCode,
            payDate: query.vnp_PayDate,
            bankTranNo: query.vnp_BankTranNo,
            cardType: query.vnp_CardType,
          }
        };
      }

      return { isValid: false, error: 'Invalid secure hash' };
    } catch (error) {
      console.error('VNPay return URL verification error:', error);
      return { isValid: false, error: 'Verification failed' };
    }
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
      if (!query.vnp_SecureHash) {
        return {
          isValid: false,
          rspCode: '97',
          message: 'Missing secure hash'
        };
      }

      // Lấy secure hash từ query
      const vnp_SecureHash = query.vnp_SecureHash;
      
      // Tạo bản copy của query để xử lý
      const params = { ...query };
      
      // Xóa secure hash để tạo checksum
      delete params.vnp_SecureHash;

      // Loại bỏ các tham số trống
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      // Tạo secure hash từ các tham số còn lại
      const secureHash = this.createSecureHash(params);
      
      // Kiểm tra chữ ký
      if (secureHash !== vnp_SecureHash) {
        return {
          isValid: false,
          rspCode: '97',
          message: 'Invalid signature'
        };
      }

      // Kiểm tra các tham số bắt buộc
      const requiredParams = ['vnp_TxnRef', 'vnp_Amount', 'vnp_ResponseCode', 'vnp_TransactionStatus'];
      for (const param of requiredParams) {
        if (!query[param]) {
          return {
            isValid: false,
            rspCode: '99',
            message: `Missing required parameter: ${param}`
          };
        }
      }

      // Nếu chữ ký hợp lệ, trả về dữ liệu đã được parse
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
          bankTranNo: query.vnp_BankTranNo,
          cardType: query.vnp_CardType,
          // Thêm flag để dễ dàng kiểm tra
          isSuccess: query.vnp_ResponseCode === '00' && query.vnp_TransactionStatus === '00',
        },
        rspCode: '00',
        message: 'Confirm Success'
      };
      
    } catch (error) {
      console.error('VNPay IPN verification error:', error);
      return {
        isValid: false,
        rspCode: '99',
        message: 'Unknown error'
      };
    }
  }

  /**
   * Lấy mô tả lỗi từ response code
   */
  public getResponseCodeMessage(code: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };
    
    return messages[code] || 'Lỗi không xác định';
  }

  /**
   * Lấy mô tả trạng thái giao dịch
   */
  public getTransactionStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      '00': 'Giao dịch thành công',
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi',
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'GD Hoàn trả bị từ chối'
    };
    
    return messages[status] || 'Trạng thái không xác định';
  }
}