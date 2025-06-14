import axios from 'axios';

export const addToProject = async (itemId: string, quantity: number, reason: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/addtoproject`,
      { itemId, quantity, reason },
      { withCredentials: true } // ✅ This enables cookies/session to be sent
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to add to project');
  }
};


export const requestItem = async (
  itemId: string,
  quantity: number,
  reason: string,
  returnDate: string
) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/requestitem`,
      {
        itemId,
        quantity,
        reason,
        returnDate,
      },
      {
        withCredentials: true, // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error in requestItem API:', error.response?.data || error.message);
    throw new Error('Failed to request item');
  }
};

export const returnItem = async (transactionId: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/returnitem`,
      { transactionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error in returnItem API:', error);
    throw new Error('Failed to return item');
  }
}

export const approveRequest = async (transactionId: string) => {
  try {
    console.log('Approving transaction with ID:', transactionId);
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/approvetransaction`,
      { transactionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error in approveRequest API:', error);
    throw new Error('Failed to approve request');
  }
}

export const rejectRequest = async (transactionId: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/rejecttransaction`,
      { transactionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error in rejectRequest API:', error);
    throw new Error('Failed to reject request');
  }
}

export const returnItemToInventory = async (transactionId: string) => {
  try {
    console.log('Returning item with transaction ID:', transactionId);
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/returnitem`,
      { transactionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error in returnItemToInventory API:', error);
    throw new Error('Failed to return item to inventory');
  }
}

export const fetchTransactionsForItem = async (id: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BACKEND}/api/transaction/gettransaction/${id}`,
    { withCredentials: true }
  );
  return response.data;
};


export const fetchTransactionDetails = async (transactionId: string) => {
  const res = await axios.get(`${import.meta.env.VITE_BACKEND}/api/transaction/gettransactiondetails/${transactionId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const issueItem = async (transactionId: string) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND}/api/transaction/issueitem`,
      { transactionId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error in issueItem API:', error);
    throw new Error('Failed to issue item');
  }
};

export const fetchMyTransactions = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND}/api/transaction/getalltransactions`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching my transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

export const fetchUrgentTransactions = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND}/api/transaction/geturgenttransactions`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching my transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};