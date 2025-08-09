'use server';

import prisma from '@/lib/prisma';
import { PaymentStatus, OrderStatus } from '@/lib/generated/prisma';


// Generate unique order number
const generateOrderNumber = () => {
  return `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Create a new order
export async function createOrder({
  userId,
  shippingInfo,
  orderItems,
  totalAmount,
  txnRef,
}: {
  userId: string;
  shippingInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    notes?: string;
  };
  orderItems: {
    bookId: string;
    quantity: number;
    version: 'color' | 'black_and_white';
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  txnRef: string;
}) {
  try {
    const orderNumber = generateOrderNumber();
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        shippingFullName: shippingInfo.fullName,
        shippingPhone: shippingInfo.phone,
        shippingEmail: shippingInfo.email,
        shippingAddress: shippingInfo.address,
        notes: shippingInfo.notes,
        subtotal,
        shippingFee: 0, // Free shipping
        totalAmount,
        paymentMethod: 'VNPAY',
        paymentStatus: 'PENDING',
        transactionId: txnRef,
        status: 'PENDING',
        orderItems: {
          create: orderItems.map(item => ({
            bookId: item.bookId,
            quantity: item.quantity,
            version: item.version,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return { success: true, data: order };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, message: 'Failed to create order' };
  }
}

// Update order status based on VNPay response
export async function updateOrderStatus({
  txnRef,
  paymentStatus,
  orderStatus,
  paymentTransactionId,
  bankCode,
}: {
  txnRef: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentTransactionId?: string;
  bankCode?: string;
}) {
  try {
    const order = await prisma.order.findFirst({
      where: { transactionId: txnRef },
    });

    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus !== 'PENDING') {
      return { success: false, message: 'Order already processed' };
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        status: orderStatus,
        paymentTransactionId,
        ...(bankCode && { notes: order.notes ? `${order.notes} | Bank: ${bankCode}` : `Bank: ${bankCode}` }),
      },
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, message: 'Failed to update order' };
  }
}