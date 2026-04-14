export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  const num = Number(value);
  return Number.isFinite(num) ? `₹${num.toLocaleString('en-IN')}` : '₹0';
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return 'N/A';
  }
}

export function getPaymentType(remainingAmount, inputAmount) {
  if (!inputAmount || Number(inputAmount) <= 0) return 'NONE';
  const remaining = Number(remainingAmount) || 0;
  const input = Number(inputAmount);

  if (input < remaining - 100) return 'PARTIAL';
  if (Math.abs(input - remaining) <= 100) return 'FULL';
  return 'EXTRA';
}

export function validatePaymentFields(paymentDetails, amount, collectedBy) {
  const errors = {};

  if (!paymentDetails) {
    errors.general = 'Payment details not available';
  } else {
    if (!paymentDetails.lan) {
      errors.general = 'Invalid LAN';
    }

    const remainingAmount = Number(paymentDetails.remaining_amount);
    if (remainingAmount <= 0 || remainingAmount === null) {
      errors.general = 'No dues found for this account';
    }

    if (paymentDetails.status === 'Paid' || paymentDetails.payment_date) {
      errors.general = 'This account is already paid';
    }
  }

  if (!amount || Number(amount) <= 0) {
    errors.amount = 'Please enter a valid amount';
  } else {
    const numAmount = Number(amount);
    if (numAmount < 100) {
      errors.amount = 'Minimum payment amount is ₹100';
    }
  }

  if (!collectedBy || !collectedBy.trim()) {
    errors.collectedBy = 'Please select collector';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const paymentFields = [
  { key: 'lan', label: 'LAN', format: 'text' },
  { key: 'due_date', label: 'Due Date', format: 'date' },
  { key: 'emi', label: 'EMI', format: 'currency' },
  { key: 'interest', label: 'Interest', format: 'currency' },
  { key: 'principal', label: 'Principal', format: 'currency' },
  { key: 'opening', label: 'Opening', format: 'currency' },
  { key: 'closing', label: 'Closing', format: 'currency' },
  { key: 'remaining_emi', label: 'Remaining EMI', format: 'number' },
  {
    key: 'remaining_interest',
    label: 'Remaining Interest',
    format: 'currency',
  },
  {
    key: 'remaining_principal',
    label: 'Remaining Principal',
    format: 'currency',
  },
  { key: 'dpd', label: 'DPD', format: 'number' },
  { key: 'remaining_amount', label: 'Remaining Amount', format: 'currency' },
  { key: 'extra_paid', label: 'Extra Paid', format: 'currency' },
  { key: 'payment_date', label: 'Payment Date', format: 'date' },
  { key: 'status', label: 'Status', format: 'text' },
];

export function formatFieldValue(value, format) {
  if (value === null || value === undefined) return 'N/A';

  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'date':
      return formatDate(value);
    case 'number':
      return String(Number(value) || 0);
    default:
      return String(value);
  }
}
