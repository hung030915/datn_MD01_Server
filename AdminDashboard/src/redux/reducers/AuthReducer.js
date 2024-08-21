import {
  CLEAR_DATA_TOKEN,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
} from "../constants";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        data: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        data: null,
      };
    case CLEAR_DATA_TOKEN:
      return {
        ...state,
        loading: false,
        error: null,
        data: null,
      };
    default:
      return state;
  }
};

export default AuthReducer;
