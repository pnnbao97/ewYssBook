// app/api/paymentwall/pingback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYMENTWALL_CONFIG = {
  publicKey: 'e6960074ed9197ef99de1f3165620e87',
  privateKey: '65da480110ee53f279b542b79ffe6c6e',
};

// Generate signature for pingback validation
function generateSignature(params: { [key: string]: any }, privateKey: string, version = 2) {
  const paramsForSign = { ...params };
  delete paramsForSign.sig; // Remove signature from params
  
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(paramsForSign).sort();
  
  // Create base string
  const baseString = sortedKeys
    .map(key => `${key}=${paramsForSign[key] === false ? '0' : paramsForSign[key]}`)
    .join('');

  const signatureString = baseString + privateKey;
  
  let hash;
  if (version === 3) {
    hash = crypto.createHash('sha256').update(signatureString).digest('hex');
  } else {
    hash = crypto.createHash('md5').update(signatureString).digest('hex');
  }
  
  return hash;
}

export async function GET(request: NextRequest) {
  try {
    // Get all query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: { [key: string]: string } = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    console.log('Received pingback:', params);

    // Required parameters check
    if (!params.uid || !params.goodsid || !params.sig) {
      console.error('Missing required pingback parameters');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Validate signature
    const receivedSignature = params.sig;
    const calculatedSignature = generateSignature(params, PAYMENTWALL_CONFIG.privateKey, 2);
    
    console.log('Received signature:', receivedSignature);
    console.log('Calculated signature:', calculatedSignature);

    if (receivedSignature !== calculatedSignature) {
      console.error('Invalid pingback signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Extract pingback data
    const {
      uid: userId,
      goodsid: orderRef,
      slength,
      speriod,
      type,
      ref: transactionRef,
      sign_version,
      custom_shipping_name,
      custom_user_id,
      custom_shipping_phone,
      custom_shipping_address,
      custom_notes
    } = params;

    // Check pingback type
    const pingbackType = parseInt(type);
    
    if (pingbackType === 0) {
      // ✅ PAYMENT SUCCESSFUL - Deliver product
      console.log(`✅ Payment successful for order: ${orderRef}`);
      
      try {
        // TODO: Update order status in database
        // await updateOrderStatus(orderRef, 'COMPLETED', {
        //   paymentStatus: 'PAID',
        //   transactionRef,
        //   paidAt: new Date(),
        //   paymentMethod: 'Paymentwall'
        // });

        console.log(`Order ${orderRef} marked as completed`);
        
        // TODO: Send confirmation email to customer
        // await sendOrderConfirmationEmail(orderRef);
        
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Still return OK to avoid Paymentwall retries
      }
      
    } else if (pingbackType === 1) {
      // ❌ PAYMENT FAILED/CANCELLED - Do not deliver
      console.log(`❌ Payment failed/cancelled for order: ${orderRef}`);
      
      // TODO: Update order status
      // await updateOrderStatus(orderRef, 'CANCELLED', {
      //   paymentStatus: 'FAILED',
      //   transactionRef
      // });
      
    } else if (pingbackType === 2) {
      // ⏳ PAYMENT PENDING - Set as pending
      console.log(`⏳ Payment pending for order: ${orderRef}`);
      
      // TODO: Update order status
      // await updateOrderStatus(orderRef, 'PENDING', {
      //   paymentStatus: 'PENDING',
      //   transactionRef
      // });
    }

    // IMPORTANT: Must return "OK" for Paymentwall to stop sending pingbacks
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Pingback processing error:', error);
    
    // Return error but Paymentwall will retry
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Also handle POST method (some configurations might use POST)
export async function POST(request: NextRequest) {
  return GET(request);
}