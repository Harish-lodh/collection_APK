import { BACKEND_BASE_URL } from "@env";
import apiClient from "../server/apiClient";

export const fetchAutoData = async (product, key, value, setters) => {
  if (!product) {
    console.warn("No product selected for auto-fetch");
    return;
  }

  const normalizedProduct = String(product).toLowerCase().trim();

  const url = `${BACKEND_BASE_URL}/lms/user-Details`;

  try {
    console.log(url, key, value);

    const res = await apiClient.get(url, {
      params: {
        [key]: value,        // ✅ fixed (no finalKey)
        product: normalizedProduct,
      },
    });

    const result = res?.data?.data?.[0];
    if (!result) return;

    setters.setCustomerName(result.customerName || result.name || "");
    setters.setLoanId(result.lan || result.loanId || "");
    setters.setPartnerLoanId(result.partnerLoanId || "");
    setters.setContactNumber(result.mobileNumber || result.mobile || "");
    setters.setPanNumber(result.panNumber || "");

    if (result.vehicleNumber || result.vehicleNo) {
      setters.setVehicleNumber(result.vehicleNumber || result.vehicleNo);
    }
  } catch (err) {
    console.log(
      "Auto-fetch error:",
      err?.response?.data || err.message || err
    );
  }
};
