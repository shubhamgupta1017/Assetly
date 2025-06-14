import React, { useRef, useState, useEffect } from 'react';
import type { MyItem } from '../../types/inventory';
import { X } from 'lucide-react';
import { updateInventoryItem } from '../../api/inventory';

interface Props {
  item: MyItem;
  onClose: () => void;
}

const UpdateModal: React.FC<Props> = ({ item, onClose }) => {
  const [name, setName] = useState(item.itemName);
  const [quantityChange, setQuantityChange] = useState('0');
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^-?\d*$/.test(val)) {
      setQuantityChange(val);
      if (error) setError('');
    }
  };

  const handleUpdate = async (): Promise<void> => {
    const changeNum = Number(quantityChange);

    if (!name.trim()) {
      setError('Item name cannot be empty.');
      return;
    }

    if (quantityChange.trim() === '' || Number.isNaN(changeNum)) {
      setError('Please provide a valid quantity change.');
      return;
    }

    if (changeNum === 0 && name.trim() === item.itemName) {
      setError('Nothing to update.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateInventoryItem(item._id, {
        itemName: name.trim(),
        changeInQuantity: changeNum,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
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
          aria-label="Close update modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Update <span className="text-black">{item.itemName}</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Item Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter new item name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity Change (can be negative)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="-?\d*"
              value={quantityChange}
              onChange={handleQuantityChange}
              placeholder="e.g., -2 or 5"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              autoComplete="off"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mt-2">⚠️ {error}</p>
          )}

          <button
            onClick={handleUpdate}
            disabled={loading}
            className={`w-full mt-4 ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
