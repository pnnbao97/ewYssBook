// app/api/paymentwall/pingback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYMENTWALL_CONFIG = {
  publicKey: process.env.PAYMENTWALL_PUBLIC_KEY!,
  privateKey: process.env.PAYMENTWALL_PRIVATE_KEY!,
};

// Generate signature for pingback validation
function generateSignature(params: { [key: string]: any }, privateKey: string, version = 2) {
  const paramsForSign = { ...params };
  delete paramsForSign.sig; // Remove signature from params
  
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(paramsForSign).sort();
  
  // Create base string with proper value conversion
  const baseString = sortedKeys
    .map(key => {
      let value = paramsForSign[key];
      
      // Convert boolean false to '0', boolean true to '1'
      if (value === false || value === 'false') {
        value = '0';
      } else if (value === true || value === 'true') {
        value = '1';
      }
      
      // Convert to string if not already
      value = String(value);
      
      return `${key}=${value}`;
    })
    .join('');

  const signatureString = baseString + privateKey;
  
  console.log('Base string for signature:', baseString);
  console.log('Signature string (with private key):', signatureString);
  
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
    const signVersion = params.sign_version ? parseInt(params.sign_version) : 2;
    const calculatedSignature = generateSignature(params, PAYMENTWALL_CONFIG.privateKey, signVersion);
    
    console.log('Received signature:', receivedSignature);
    console.log('Calculated signature:', calculatedSignature);
    console.log('Sign version:', signVersion);

    if (receivedSignature !== calculatedSignature) {
      console.error('Invalid pingback signature');
      console.log('Parameters used for signature:', JSON.stringify(params, null, 2));
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
      is_test,
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
      
      // Check if this is a test transaction
      if (is_test === '1') {
        console.log('⚠️  This is a TEST transaction');
      }
      
      try {
        // TODO: Update order status in database
        // await updateOrderStatus(orderRef, 'COMPLETED', {
        //   paymentStatus: 'PAID',
        //   transactionRef,
        //   paidAt: new Date(),
        //   paymentMethod: 'Paymentwall',
        //   isTest: is_test === '1'
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