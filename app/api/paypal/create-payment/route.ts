// app/api/paypal/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import { createOrder } from '@/lib/actions/orders';

// PayPal Environment Setup
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal client ID and secret must be defined in environment variables.');
  }
  
  // Sử dụng SandboxEnvironment cho testing, LiveEnvironment cho production
  return process.env.NODE_ENV === 'production' 
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// PayPal Client
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      amount,
      currency = 'USD',
      shippingInfo,
      orderItems,
      txnRef // Generate unique transaction reference
    } = body;

    // Validate required fields
    if (!userId || !amount || !shippingInfo || !orderItems || !txnRef) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Calculate item total to ensure it matches
    const itemTotal = orderItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.unitPrice) * parseInt(item.quantity));
    }, 0);

    // Create PayPal Order Request
    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.prefer("return=representation");
    
    paypalRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: txnRef, // Add reference ID for tracking
        amount: {
          currency_code: currency,
          value: numericAmount.toFixed(2),
          breakdown: {
              item_total: {
                  currency_code: currency,
                  value: itemTotal.toFixed(2)
              },
              discount: {
                  currency_code: currency,
                  value: "0.00"
              },
              handling: {
                  currency_code: currency,
                  value: "0.00"
              },
              insurance: {
                  currency_code: currency,
                  value: "0.00"
              },
              shipping_discount: {
                  currency_code: currency,
                  value: "0.00"
              },
              shipping: {
                  currency_code: currency,
                  value: "0.00"
              },
              tax_total: {
                  currency_code: currency,
                  value: "0.00"
              }
          }
        },
        items: orderItems.map((item: any) => ({
          name: item.bookTitle || `Book ID: ${item.bookId}`,
          unit_amount: {
            currency_code: currency,
            value: parseFloat(item.unitPrice).toFixed(2)
          },
          quantity: item.quantity.toString(),
          category: 'PHYSICAL_GOODS'
        })),
        shipping: {
          name: {
            full_name: shippingInfo.fullName
          },
          address: {
            address_line_1: shippingInfo.address,
            admin_area_2: shippingInfo.city || "Ho Chi Minh City",
            admin_area_1: shippingInfo.state || "Ho Chi Minh",
            postal_code: shippingInfo.postalCode || "700000",
            country_code: "VN"
          }
        }
      }],
      application_context: {
        brand_name: "Your Bookstore Name",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/paypal/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thanh-toan/checkout`
      }
    });

    // Execute PayPal Request
    const order = await client().execute(paypalRequest);
    
    // Find approval URL
    const approvalUrl = order.result.links.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response');
    }

    // Create order in database with PENDING status
    const orderResult = await createOrder({
      userId,
      paypalOrderId: order.result.id, // Store PayPal order ID
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        address: shippingInfo.address,
        notes: shippingInfo.notes,
      },
      orderItems,
      totalAmount: numericAmount,
      txnRef,
      status: 'PENDING', // Set initial status as PENDING
      paymentMethod: 'PAYPAL',
      currency
    });

    if (!orderResult.success) {
      // If database save fails, we might want to cancel the PayPal order
      // but for now, we'll just return the error
      return NextResponse.json(
        { success: false, error: orderResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.result.id,
      approvalUrl,
      databaseOrderId: orderResult.orderId
    });

  } catch (error) {
    console.error('PayPal Create Payment Error:', error);
    
    // More detailed error handling
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create PayPal payment'
    }, { status: 500 });
  }
}