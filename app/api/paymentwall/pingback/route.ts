// app/api/paymentwall/pingback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYMENTWALL_CONFIG = {
  publicKey: process.env.PAYMENTWALL_PUBLIC_KEY!,
  privateKey: process.env.PAYMENTWALL_PRIVATE_KEY!,
};

// Generate signature exactly as per Paymentwall documentation
function generateSignature(params: { [key: string]: any }, privateKey: string, version = 2) {
  const paramsForSign = { ...params };
  delete paramsForSign.sig; // Remove signature from params
  
  // Sort parameters alphabetically by key name
  const sortedKeys = Object.keys(paramsForSign).sort();
  
  // Create base string according to Paymentwall docs:
  // "PARAM_NAME_1=PARAM_VALUE_1PARAM_NAME_2=PARAM_VALUE_2...PARAM_NAME_n=PARAM_VALUE_nSECRET_KEY"
  let baseString = '';
  
  sortedKeys.forEach(key => {
    let value = paramsForSign[key];
    
    // Handle boolean false as '0' (from docs: $value === false ? '0' : $value)
    if (value === false) {
      value = '0';
    }
    // Keep all other values as-is (including string 'false', 'true', etc.)
    
    baseString += key + '=' + value;
  });
  
  // Append private key at the end
  baseString += privateKey;
  
  console.log('Signature calculation:');
  console.log('- Sorted keys:', sortedKeys);
  console.log('- Base string:', baseString);
  console.log('- Using hash:', version === 3 ? 'SHA256' : 'MD5');
  
  // Calculate hash based on version
  let hash;
  if (version === 3) {
    hash = crypto.createHash('sha256').update(baseString).digest('hex');
  } else {
    hash = crypto.createHash('md5').update(baseString).digest('hex');
  }
  
  return hash;
}

// For debugging - try variations if standard doesn't work
function debugSignatureVariations(params: { [key: string]: any }, privateKey: string) {
  const paramsForSign = { ...params };
  delete paramsForSign.sig;
  
  const variations = [];
  
  // Standard Paymentwall format (from docs)
  const sortedKeys = Object.keys(paramsForSign).sort();
  let baseString = '';
  sortedKeys.forEach(key => {
    let value = paramsForSign[key];
    if (value === false) value = '0';
    baseString += key + '=' + value;
  });
  baseString += privateKey;
  
  variations.push({
    name: 'Standard (docs format)',
    base: baseString,
    md5: crypto.createHash('md5').update(baseString).digest('hex'),
    sha256: crypto.createHash('sha256').update(baseString).digest('hex')
  });
  
  // Try with uppercase private key
  const upperBaseString = baseString.replace(privateKey, privateKey.toUpperCase());
  variations.push({
    name: 'With uppercase private key',
    base: upperBaseString,
    md5: crypto.createHash('md5').update(upperBaseString).digest('hex'),
    sha256: crypto.createHash('sha256').update(upperBaseString).digest('hex')
  });
  
  // Try converting string 'false'/'true' to 0/1
  let baseStringConverted = '';
  sortedKeys.forEach(key => {
    let value = paramsForSign[key];
    if (value === false || value === 'false') value = '0';
    else if (value === true || value === 'true') value = '1';
    baseStringConverted += key + '=' + value;
  });
  baseStringConverted += privateKey;
  
  variations.push({
    name: 'Convert string false/true to 0/1',
    base: baseStringConverted,
    md5: crypto.createHash('md5').update(baseStringConverted).digest('hex'),
    sha256: crypto.createHash('sha256').update(baseStringConverted).digest('hex')
  });
  
  return variations;
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

    const receivedSignature = params.sig;
    const signVersion = params.sign_version ? parseInt(params.sign_version) : 2;
    
    console.log('\n=== Paymentwall Pingback Validation ===');
    console.log('All parameters:', JSON.stringify(params, null, 2));
    console.log('Received signature:', receivedSignature);
    console.log('Sign version:', signVersion);
    console.log('Private key length:', PAYMENTWALL_CONFIG.privateKey.length);
    
    // Calculate signature using standard method
    const calculatedSignature = generateSignature(params, PAYMENTWALL_CONFIG.privateKey, signVersion);
    console.log('Calculated signature:', calculatedSignature);
    console.log('Signatures match:', receivedSignature === calculatedSignature);
    
    let isValidSignature = receivedSignature === calculatedSignature;
    
    // If standard doesn't match, try debug variations
    if (!isValidSignature) {
      console.log('\n=== Trying variations ===');
      const variations = debugSignatureVariations(params, PAYMENTWALL_CONFIG.privateKey);
      
      variations.forEach(variation => {
        console.log(`\n${variation.name}:`);
        console.log(`Base: ${variation.base}`);
        console.log(`MD5: ${variation.md5} ${variation.md5 === receivedSignature ? '✅ MATCH' : ''}`);
        console.log(`SHA256: ${variation.sha256} ${variation.sha256 === receivedSignature ? '✅ MATCH' : ''}`);
        
        if (variation.md5 === receivedSignature || variation.sha256 === receivedSignature) {
          isValidSignature = true;
        }
      });
    }

    if (!isValidSignature) {
      console.error('\n❌ Invalid pingback signature - no variation matched');
      console.log('Double-check:');
      console.log('1. Private key in .env matches Paymentwall dashboard');
      console.log('2. All parameters are being sent correctly');
      console.log('3. No extra parameters or missing parameters');
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('\n✅ Signature validated successfully!');

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