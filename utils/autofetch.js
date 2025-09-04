

import axios from 'axios'
import {BACKEND_BASE_URL} from '@env';
import { getAuthToken } from '../components/authToken';
export const fetchAutoData = async (key, value, setters) => {
  try {
    const token = await getAuthToken();

    const res = await axios.get(`${BACKEND_BASE_URL}/embifi/auto-fetch`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        [key]: value
      }
    });
    console.log(res);
    if (res.data?.data?.length > 0) {
      const result = res.data.data[0]; // Assuming you're using the first match
      setters.setCustomerName(result.customerName || '');
      setters.setLoanId(result.lan || '');
      setters.setPartnerLoanId(result.partnerLoanId  || '');
      setters.setContactNumber(result.mobileNumber || '');
      setters.setPanNumber(result.panNumber || '');
    } else {
      console.log("No matching data found.");
    }

  } catch (err) {
    console.log("Auto-fetch error", err);
  }
};

