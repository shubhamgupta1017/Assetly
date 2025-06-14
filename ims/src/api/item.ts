import axios from "axios";

export const getItemInfo = async (id: string): Promise<any> => {
  try {
    console.log("Fetching item info...", id);
    const res = await axios.get(`${import.meta.env.VITE_BACKEND}/api/item/info/${id}`, {
      withCredentials: true,
    });

    // Destructure required fields from response
    const {
      _id,
      ownerId,
      totalQuantity,
      availableQuantity,
      issuedQuantity,
      projectQuantity,
    } = res.data;

    console.log("Item info fetched successfully:", {
      _id,
      ownerId,
      totalQuantity,
      availableQuantity,
      issuedQuantity,
      projectQuantity,
    });

    return res.data; // returning the full item object
  } catch (err) {
    console.error("Failed to fetch item info:", err);
    return null;
  }
};

export const checkItemOwner = async (id: string): Promise<boolean> => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND}/api/item/check-owner/${id}`, {
      withCredentials: true,
    });

    return res.data.owner;
  } catch (err) {
    console.error('Failed to check item owner:', err);
    return false;
  }
};

export const fetchAllItems = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND}/api/item/all`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching all items:', error);
    throw error;
  }
};