import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createInventoryItem } from '../../api/inventory';
import type { MyItem } from '../../types/inventory';

interface Props {
  onClose: () => void;
  onAdded: (newItem: MyItem) => void;
}

const AddModal: React.FC<Props> = ({ onClose, onAdded }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const handleAdd = async () => {
    if (!name.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
      setError('Please enter valid item name and quantity.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newItem = await createInventoryItem({
        name: name.trim(),
        TotalQuantity: Number(quantity),
      });
      onAdded(newItem);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border-t-4 border-blue-600 animate-fadeIn"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Add New Inventory Item
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min={0}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              required
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">⚠️ {error}</p>
          )}

          <button
            onClick={handleAdd}
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
