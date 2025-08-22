import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Paymentwall configuration
const PAYMENTWALL_CONFIG = {
  publicKey: 'e6960074ed9197ef99de1f3165620e87',
  privateKey: '65da480110ee53f279b542b79ffe6c6e',
  apiType: 2, // API_GOODS
  baseUrl: 'https://api.paymentwall.com/api/subscription',
};

// Generate signature for Paymentwall according to their documentation
function generateSignature(params: { [key: string]: any }, privateKey: string, version = 2) {
  // Create a copy without the sign parameter
  const paramsForSign = { ...params };
  delete paramsForSign.sign;

  // Sort parameters alphabetically by key
  const sortedKeys = Object.keys(paramsForSign).sort();
  
  // Create base string according to Paymentwall docs: key1=value1key2=value2key3=value3
  // NO ampersands between parameters!
  const baseString = sortedKeys
    .map(key => `${key}=${paramsForSign[key] === false ? '0' : paramsForSign[key]}`)
    .join(''); // ✅ Direct concatenation, no '&' separator

  const signatureString = baseString + privateKey;
  
  // Generate hash based on version
  let hash;
  if (version === 3) {
    hash = crypto.createHash('sha256').update(signatureString).digest('hex');
  } else {
    hash = crypto.createHash('md5').update(signatureString).digest('hex');
  }
  
  console.log('Generated signature:', hash);
  return hash;
}

// Helper function to remove Unicode characters
const sanitizeString = (str: string) => {
  if (!str) return '';
  return str.normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
           .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
           .trim();
};

// Create Paymentwall widget URL
function createPaymentWallWidget(orderData: { 
  userId: any; 
  orderRef: any; 
  amount: any; 
  currency?: string; 
  shippingInfo: any; 
  orderItems: any; 
}) {
  const {
    userId,
    orderRef,
    amount,
    currency = 'VND',
    shippingInfo,
    orderItems
  } = orderData;

  // Combine all items into one product for Paymentwall
  // Use ASCII only for product name to avoid Unicode issues
  const productName = orderItems.length === 1 
    ? (orderItems[0].bookTitle ? sanitizeString(`Book: ${orderItems[0].bookTitle}`).substring(0, 50) : 'Book Order')
    : `Book Order (${orderItems.length} items)`;

  // Get base URL with fallback
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Start with minimal required parameters to test signature first
  const params: { [key: string]: string } = {
    key: PAYMENTWALL_CONFIG.publicKey,
    uid: userId || `guest_${Date.now()}`,
    widget: 'pw_1', // Verify this widget code in your Paymentwall dashboard
    ps: 'all', // Show all available payment methods
    ag_name: productName,
    ag_external_id: orderRef,
    ag_type: 'fixed', // Must be 'fixed' for onetime payment
    amount: parseFloat(amount).toFixed(2), // Ensure 2 decimal places
    currencyCode: currency,
    email: shippingInfo.email,
    'history[registration_date]': Math.floor(Date.now() / 1000).toString(), // Unix timestamp
    success_url: `${baseUrl}/don-hang/thanh-cong?order=${orderRef}`,
    sign_version: '2', // Start with MD5 (version 2) as it's more commonly supported
  };

  // Add minimal custom parameters with sanitized strings
  if (orderRef) {
    params['custom[order_ref]'] = orderRef;
  }
  if (userId) {
    params['custom[user_id]'] = userId;
  }
  if (shippingInfo.fullName) {
    params['custom[shipping_name]'] = sanitizeString(shippingInfo.fullName);
  }
  if (shippingInfo.phone) {
    params['custom[shipping_phone]'] = shippingInfo.phone;
  }
  if (shippingInfo.address) {
    params['custom[shipping_address]'] = sanitizeString(shippingInfo.address);
  }
  if (shippingInfo.notes) {
    params['custom[notes]'] = sanitizeString(shippingInfo.notes);
  }

  // Add signature using version 2 (MD5)
  params.sign = generateSignature(params, PAYMENTWALL_CONFIG.privateKey, 2);

  // Build URL
  const queryString = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const finalUrl = `${PAYMENTWALL_CONFIG.baseUrl}?${queryString}`;
  
  return finalUrl;
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Validate required fields
    if (!orderData.amount || !orderData.shippingInfo?.email || !orderData.orderItems?.length) {
      return NextResponse.json({
        success: false,
        error: 'Missing required order data'
      }, { status: 400 });
    }

    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.shippingInfo.email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate amount (minimum USD 0.3 equivalent)
    if (orderData.amount < 0.3) {
      return NextResponse.json({
        success: false,
        error: 'Amount too small (minimum 0.3 USD equivalent)'
      }, { status: 400 });
    }

    // Ensure orderRef exists
    if (!orderData.orderRef) {
      return NextResponse.json({
        success: false,
        error: 'Order reference is required'
      }, { status: 400 });
    }

    // TODO: Save order to database with status 'PENDING'
    // const savedOrder = await saveOrderToDatabase({
    //   ...orderData,
    //   status: 'PENDING',
    //   paymentStatus: 'PENDING',
    //   createdAt: new Date(),
    // });

    // Generate Paymentwall payment URL
    const paymentUrl = createPaymentWallWidget(orderData);

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderRef: orderData.orderRef,
    });

  } catch (error) {
    console.error('Paymentwall payment creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment'
    }, { status: 500 });
  }
}