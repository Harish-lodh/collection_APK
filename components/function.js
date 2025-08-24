// export default function isLoanId(input) {
//   // Example: Loan ID starts with 2-5 uppercase letters and then numbers, like EMAPL01234567890001 or may PLID001
//   const loanIdPattern = /^[A-Z]{2,5}\d{6,}$/;
//   return loanIdPattern.test(input.trim());
// }
export default function isCustomerName(input) {
  // Remove leading/trailing whitespace
  const trimmedInput = input.trim();
  
  // Check if input is empty
  if (!trimmedInput) {
    return false;
  }
  
  // Regular expression for name: letters and spaces only
  const nameRegex = /^[A-Za-z\s]+$/;
  
  // Return true if input matches name regex, false otherwise
  return nameRegex.test(trimmedInput);
}