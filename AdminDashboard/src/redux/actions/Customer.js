import {
  FECTH_CUSTOMER_FAILURE,
  FECTH_CUSTOMER_REQUEST,
  FECTH_CUSTOMER_SUCCESS,
} from "../constants";

export const fetchCustomerRequest = (role, token) => {
  return {
    type: FECTH_CUSTOMER_REQUEST,
    payload: { role, token },
  };
};

export const fetchCustomerFail = (error) => {
  return {
    type: FECTH_CUSTOMER_FAILURE,
    payload: error,
  };
};

export const fetchCustomerSuccess = (data) => {
  return {
    type: FECTH_CUSTOMER_SUCCESS,
    payload: data,
  };
};
