// app/api/paymentwall/pingback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYMENTWALL_CONFIG = {
  publicKey: process.env.PAYMENTWALL_PUBLIC_KEY!,
  privateKey: process.env.PAYMENTWALL_PRIVATE_KEY!,
};

// Generate signature with multiple methods to match Paymentwall's format
function generateSignatureVariants(params: { [key: string]: any }, privateKey: string) {
  const paramsForSign = { ...params };
  delete paramsForSign.sig; // Remove signature from params
  
  // Convert all values to strings and handle special cases
  Object.keys(paramsForSign).forEach(key => {
    let value = paramsForSign[key];
    if (value === false || value === 'false') {
      paramsForSign[key] = '0';
    } else if (value === true || value === 'true') {
      paramsForSign[key] = '1';
    } else {
      paramsForSign[key] = String(value);
    }
  });
  
  // Sort keys alphabetically
  const sortedKeys = Object.keys(paramsForSign).sort();
  
  const variants = [];
  
  // Variant 1: key=value concatenated (no separators)
  const format1 = sortedKeys.map(key => `${key}=${paramsForSign[key]}`).join('');
  variants.push({
    name: 'Format 1 (key=value concatenated)',
    baseString: format1,
    signature: crypto.createHash('md5').update(format1 + privateKey).digest('hex')
  });
  
  // Variant 2: key=value with & separator
  const format2 = sortedKeys.map(key => `${key}=${paramsForSign[key]}`).join('&');
  variants.push({
    name: 'Format 2 (key=value with &)',
    baseString: format2,
    signature: crypto.createHash('md5').update(format2 + privateKey).digest('hex')
  });
  
  // Variant 3: values only concatenated
  const format3 = sortedKeys.map(key => paramsForSign[key]).join('');
  variants.push({
    name: 'Format 3 (values only)',
    baseString: format3,
    signature: crypto.createHash('md5').update(format3 + privateKey).digest('hex')
  });
  
  // Variant 4: Try without sorting keys (original order)
  const originalKeys = Object.keys(paramsForSign);
  const format4 = originalKeys.map(key => `${key}=${paramsForSign[key]}`).join('');
  variants.push({
    name: 'Format 4 (original key order)',
    baseString: format4,
    signature: crypto.createHash('md5').update(format4 + privateKey).digest('hex')
  });
  
  // Variant 5: Try with URL encoding
  const format5 = sortedKeys.map(key => `${key}=${encodeURIComponent(paramsForSign[key])}`).join('');
  variants.push({
    name: 'Format 5 (URL encoded)',
    baseString: format5,
    signature: crypto.createHash('md5').update(format5 + privateKey).digest('hex')
  });
  
  // Variant 6: Try Paymentwall Widget signature format
  const format6 = sortedKeys.map(key => paramsForSign[key]).join('#') + '#' + privateKey;
  variants.push({
    name: 'Format 6 (Widget format)',
    baseString: format6,
    signature: crypto.createHash('sha256').update(format6).digest('hex')
  });
  
  // Variant 7: Try with different private key position
  const format7 = privateKey + sortedKeys.map(key => `${key}=${paramsForSign[key]}`).join('');
  variants.push({
    name: 'Format 7 (private key first)',
    baseString: format7,
    signature: crypto.createHash('md5').update(format7).digest('hex')
  });

  return variants;
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
    
    console.log('All parameters received:', JSON.stringify(params, null, 2));
    console.log('Private key length:', PAYMENTWALL_CONFIG.privateKey.length);
    console.log('Private key first/last 4 chars:', 
      PAYMENTWALL_CONFIG.privateKey.substring(0, 4) + '...' + 
      PAYMENTWALL_CONFIG.privateKey.substring(PAYMENTWALL_CONFIG.privateKey.length - 4)
    );
    console.log('Received signature:', receivedSignature);

    // Try all signature variants
    const variants = generateSignatureVariants(params, PAYMENTWALL_CONFIG.privateKey);
    let isValidSignature = false;
    let matchedVariant = null;

    console.log('\n=== Trying all signature variants ===');
    variants.forEach((variant, index) => {
      console.log(`\n${variant.name}:`);
      console.log(`Base string: "${variant.baseString}"`);
      console.log(`Calculated: ${variant.signature}`);
      console.log(`Match: ${variant.signature === receivedSignature}`);
      
      if (variant.signature === receivedSignature) {
        isValidSignature = true;
        matchedVariant = variant.name;
      }
    });

    if (isValidSignature) {
      console.log(`\n✅ Signature validated using: ${matchedVariant}`);
    } else {
      console.log('\n❌ No signature variant matched');
      
      // Additional debugging: try with different private key formats
      console.log('\n=== Additional debugging ===');
      const trimmedKey = PAYMENTWALL_CONFIG.privateKey.trim();
      const upperKey = PAYMENTWALL_CONFIG.privateKey.toUpperCase();
      const lowerKey = PAYMENTWALL_CONFIG.privateKey.toLowerCase();
      
      console.log('Trying with trimmed private key:', trimmedKey !== PAYMENTWALL_CONFIG.privateKey);
      console.log('Trying with uppercase private key:', upperKey !== PAYMENTWALL_CONFIG.privateKey);
      console.log('Trying with lowercase private key:', lowerKey !== PAYMENTWALL_CONFIG.privateKey);
      
      if (trimmedKey !== PAYMENTWALL_CONFIG.privateKey) {
        const trimmedVariants = generateSignatureVariants(params, trimmedKey);
        trimmedVariants.forEach(variant => {
          if (variant.signature === receivedSignature) {
            console.log(`✅ Match found with trimmed private key using: ${variant.name}`);
            isValidSignature = true;
          }
        });
      }
    }

    if (!isValidSignature) {
      console.error('Invalid pingback signature - no variant matched');
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