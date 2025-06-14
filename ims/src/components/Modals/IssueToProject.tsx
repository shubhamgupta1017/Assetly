import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { addToProject } from '../../api/transaction';

interface IssueToProjectModalProps {
  itemId: string;
  onClose: () => void;
}

const MAX_REASON_LENGTH = 25;

const IssueToProjectModal: React.FC<IssueToProjectModalProps> = ({ itemId, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = async () => {
  if (reason.trim().length > MAX_REASON_LENGTH) {
    setMessage({ text: 'Reason must be ≤ 25 characters.', type: 'error' });
    return;
  }

  setLoading(true);
  setMessage(null);

  try {
    await addToProject(itemId, quantity, reason.trim());
    onClose();

  } catch (error) {
    setMessage({ text: ' Failed to assign item. Try again.', type: 'error' });
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
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          Assign Item to Project
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              required
              onWheel={(e) => (e.target as HTMLInputElement).blur()} // disables scroll wheel increment
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (max 25 characters)
            </label>
            <input
              type="text"
              value={reason}
              maxLength={MAX_REASON_LENGTH}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || quantity < 1 || !reason.trim()}
            className={`w-full ${
              loading || quantity < 1 || !reason.trim()
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-semibold py-2 rounded-lg transition`}
          >
            {loading ? 'Submitting...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueToProjectModal;
