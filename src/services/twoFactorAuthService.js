import api from './api';

export const enableTwoFactor = async (token) => {
  return await api.post(`/enable-2fa`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const disableTwoFactor = async (token) => {
  return await api.post(`/disable-2fa`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const verifyTwoFactor = async (code, token) => {
  return await api.post(`/verfiy-2fa`, { code }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
