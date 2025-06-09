import axios from 'axios';

const API_URL = 'https://localhost:49798'; 

export const enableTwoFactor = async (token) => {
  return await axios.post(`${API_URL}/enable-2fa`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const disableTwoFactor = async (token) => {
  return await axios.post(`${API_URL}/disable-2fa`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const verifyTwoFactor = async (code, token) => {
  return await axios.post(`${API_URL}/verfiy-2fa`, { code }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
