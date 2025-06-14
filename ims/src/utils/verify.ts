// utils/verify.ts
import axios from 'axios';

export const verify = async () => {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND}/auth/user`, {
    withCredentials: true,
  });
  console.log('Verification response:', res);
  if (res.status !== 200) {
    throw new Error('Not authenticated');
  }
};
