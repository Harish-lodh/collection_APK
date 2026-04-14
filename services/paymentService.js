import apiClient from '../server/apiClient';

export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  DUPLICATE: 'DUPLICATE',
};

const generateEmiSchedule = (totalEmis, emiAmount) => {
  const emis = [];
  const now = new Date();
  for (let i = 1; i <= totalEmis; i++) {
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + i);
    const isPast = i <= 2;
    const isPaid = isPast && Math.random() > 0.3;
    emis.push({
      id: i,
      emiNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: emiAmount,
      status: isPaid ? 'Paid' : isPast ? 'Due' : 'Pending',
      paidDate: isPaid
        ? new Date(
            now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString()
        : null,
      transactionId: isPaid ? `TXN${Date.now() - i * 1000}` : null,
    });
  }
  return emis;
};

export async function getEmiSchedule(lan,product) {
  try {
    const response = await apiClient.get(`/lms/getEmiSchedule/${lan}`, {
      params: { product: product },
    });

    return {
      success: true,
      data: response.data?.data || [],
    };
  } catch (error) {
    console.log('Error message:', error.message);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to load EMI schedule. Please try again.',
    };
  }
}

export async function initiatePayment(emiId, product) {
  try {
    const response = await apiClient.post('/payments/easebuzz/collect', {
      emiId,
      product,
    });
    return {
      success: response.data?.success ?? true,
      data: response.data,
      merchantTxn: response.data?.merchant_txn,
      paymentUrl: response.data?.payment_url,
    };
  } catch (error) {
    console.log('Payment API error:', error.message);
    return {
      success: false,
      error:
        error.response?.data?.message || 'Payment failed. Please try again.',
    };
  }
}

export async function verifyPayment(merchantTxn) {
  try {
    console.log("merchantTxn",merchantTxn)
    const response = await apiClient.get(
      `payments/easebuzz/payment-status/${merchantTxn}`,
    );
    return {
      success: true,
      data: response.data,
      paymentDone: response.data?.payment_done ?? false,
      status: response.data?.status,
    };
  } catch (error) {
    console.log('Verify payment API error:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify payment.',
    };
  }
}

