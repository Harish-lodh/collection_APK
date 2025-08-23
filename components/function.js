export default function isLoanId(input) {
  // Example: Loan ID starts with 2-5 uppercase letters and then numbers, like EMAPL01234567890001
  const loanIdPattern = /^[A-Z]{2,5}\d{6,}$/;
  return loanIdPattern.test(input.trim());
}
