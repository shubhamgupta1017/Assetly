import axios from 'axios';

export const fetchCurrentUser = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND}/auth/me`,
      { withCredentials: true }
    );
    console.log('Current user fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all items:', error);
    throw error;
  }
};