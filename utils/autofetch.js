import axios from "axios";
import { BACKEND_BASE_URL } from "@env";
import { getAuthToken } from "../components/authToken";

export const fetchAutoData = async (product, key, value, setters) => {
  if (!product) return console.warn("No product selected for auto-fetch");

  const normalizedProduct = String(product).toLowerCase().trim();

  let url;
  let finalKey = key; // default same key

  if (normalizedProduct === "embifi") {
    url = `${BACKEND_BASE_URL}/embifi/auto-fetch`;
  } else if (normalizedProduct === "malhotra") {
    url = "https://fintreelms.com/api/collection/malhotra/search";

    // 👇 special mapping only for Malhotra API
    if (key === "phoneNumber") {
      finalKey = "mobileNumber";
    }
  } else {
    console.warn("Unsupported product:", normalizedProduct);
    return;
  }

  try {
    const token = await getAuthToken();
    console.log(url, finalKey, value);

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: { [finalKey]: value },
    });

    const result = res.data?.data?.[0];
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
    console.log("Auto-fetch error:", err?.response?.data || err);
  }
};
