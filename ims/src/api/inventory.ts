import axios from "axios";
import type { MyItem } from '../types/inventory';


export const getInventoryItems = async (): Promise<MyItem[]> => {
  try {

    const res = await axios.get(`${import.meta.env.VITE_BACKEND}/api/inventory/byowner`, {
      withCredentials: true
    });

    return res.data.items;
  } catch (err) {
    console.error("Failed to fetch items:", err);
    return [];
  }
};


export async function createInventoryItem(data: { name: string; TotalQuantity: number }) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/inventory/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
    body: JSON.stringify({
      itemName: data.name,
      totalQuantity: data.TotalQuantity
    })
  });

  if (!res.ok) {
    let errorMsg = `Failed: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // fallback error message
    }
    throw new Error(errorMsg);
  }

  const responseData = await res.json();
  return responseData.item ?? responseData;
}


// src/api/inventory.ts
export async function deleteInventoryItem(id: string) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/inventory/delete/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    let errorMsg = `Failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // Fallback if response isn't JSON
    }
    throw new Error(errorMsg);
  }
}



// src/api/inventory.ts
export async function updateInventoryItem(id: string, data: Partial<MyItem>) {
  const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/inventory/update/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  console.log("Update response:", res);
  if (!res.ok) {
    let errorMsg = `Failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // response has no JSON body, leave errorMsg as-is
    }
    throw new Error(errorMsg);
  }

  // Only parse JSON if content exists
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }

  return null;
}

