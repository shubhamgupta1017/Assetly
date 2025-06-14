import React, { useEffect, useState } from 'react';
import { getInventoryItems } from '../api/inventory';
import type { MyItem } from '../types/inventory';
import UpdateModal from '../components/Modals/Update';
import DeleteModal from '../components/Modals/Delete';
import AddModal from '../components/Modals/Add';
import InventoryTable from '../components/Inventory/InventoryTable';

const MyInventory: React.FC = () => {
  const [items, setItems] = useState<MyItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortKey, setSortKey] = useState<keyof MyItem | ''>('');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MyItem | null>(null);
  const [modalType, setModalType] = useState<'update' | 'delete' | null>(null);

  // Loading and error state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load inventory items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSort = (key: keyof MyItem) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredItems = items
    .filter((item) => item.itemName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-center text-lg font-medium min-h-screen flex items-center justify-center">
        Loading inventory items...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center text-lg font-semibold min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 min-h-screen py-6 bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-8 text-black">My Inventory</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search items..."
          className="w-full sm:max-w-md rounded-xl border border-gray-300 bg-white text-gray-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow"
          onClick={() => setShowAddModal(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Item</span>
        </button>
      </div>

      <InventoryTable
        items={filteredItems}
        sortKey={sortKey}
        sortAsc={sortAsc}
        onSort={handleSort}
        onUpdate={(item) => {
          setSelectedItem(item);
          setModalType('update');
        }}
        onDelete={(item) => {
          setSelectedItem(item);
          setModalType('delete');
        }}
      />

      {showAddModal && (
        <AddModal
          onClose={() => {
            setShowAddModal(false);
            fetchItems();
          }}
          onAdded={() => fetchItems()}
        />
      )}

      {modalType === 'update' && selectedItem && (
        <UpdateModal
          item={selectedItem}
          onClose={() => {
            setModalType(null);
            fetchItems();
          }}
        />
      )}

      {modalType === 'delete' && selectedItem && (
        <DeleteModal
          item={selectedItem}
          onClose={() => {
            setModalType(null);
            fetchItems();
          }}
        />
      )}
    </div>
  );
};

export default MyInventory;
