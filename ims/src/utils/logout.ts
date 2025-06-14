// utils/logout.ts
import axios from 'axios';

export const logout = async () => {
  try {
    await axios.get(`${import.meta.env.VITE_BACKEND}/auth/logout`, {
      withCredentials: true,
    });
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
