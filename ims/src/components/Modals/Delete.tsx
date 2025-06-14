import React, { useRef, useState, useEffect } from 'react';
import type { MyItem } from '../../types/inventory';
import { X } from 'lucide-react';
import { deleteInventoryItem } from '../../api/inventory';

interface Props {
  item: MyItem;
  onClose: () => void;
}

const DeleteModal: React.FC<Props> = ({ item, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteInventoryItem(item._id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative border-t-4 border-red-600 animate-fadeIn"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <h2 className="text-xl font-bold text-red-700 mb-2 text-center">
          Delete <span className="font-semibold">{item.itemName}</span>?
        </h2>

        <p className="text-sm text-gray-600 text-center mb-4">
          Are you sure you want to permanently delete this item from your inventory?
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mb-2">⚠️ {error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium text-white transition ${
              loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
