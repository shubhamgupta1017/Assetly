import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  approveRequest,
  rejectRequest,
  returnItemToInventory,
  fetchTransactionDetails,
  issueItem,
} from '../../api/transaction';

interface HistoryEntry {
  action: string;
  actionDescription: string;
  date: string;
}

interface Props {
  transactionId: string;
  onClose: () => void;
}

const statusColorMap: Record<string, string> = {
  Requested: 'info',
  Approved: 'success',
  Rejected: 'error',
  Returned: 'warning',
  AssignedToProject: 'secondary',
  Issued: 'primary',
  Overdue: 'error',
};

const statusDotColorMap: Record<string, string> = {
  Requested: 'bg-blue-500',
  Approved: 'bg-green-500',
  Rejected: 'bg-red-500',
  Returned: 'bg-yellow-500',
  AssignedToProject: 'bg-purple-500',
  Issued: 'bg-indigo-500',
  Overdue: 'bg-red-600',
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const TransactionDetailModal: React.FC<Props> = ({ transactionId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTransactionDetails(transactionId);
      setData(res);
    } catch {
      setError('Failed to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) fetchDetails();
  }, [transactionId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approveRequest(transactionId);
      await fetchDetails();
      (window as any).toast?.success?.('Request approved');
    } catch {
      (window as any).toast?.error?.('Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await rejectRequest(transactionId);
      await fetchDetails();
      (window as any).toast?.success?.('Request rejected');
    } catch {
      (window as any).toast?.error?.('Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssue = async () => {
    setActionLoading(true);
    try {
      await issueItem(transactionId);
      await fetchDetails();
      (window as any).toast?.success?.('Item issued');
    } catch {
      (window as any).toast?.error?.('Failed to issue item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    setReturnLoading(true);
    try {
      await returnItemToInventory(transactionId);
      await fetchDetails();
      (window as any).toast?.success?.('Returned successfully');
    } catch {
      (window as any).toast?.error?.('Failed to return');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={handleOverlayClick}>
      <div
        ref={modalRef}
        className="relative bg-white max-w-3xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 bg-indigo-50 border-b">
          <h2 className="text-xl font-semibold text-indigo-800">Transaction Details</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-indigo-800 hover:text-indigo-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 space-y-6 text-gray-800">
          {loading && <p className="text-center text-gray-600">Loading...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {data && (
            <>
              <div className="bg-gray-50 rounded-lg p-5 shadow-inner">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{data.itemName}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <p>Owner: <span className="font-medium text-gray-900">{data.ownerName}</span></p>
                  <p>Issuer: <span className="font-medium text-gray-900">{data.issuerName}</span></p>
                  <p>Issuer Contact: <span className="font-medium text-gray-900">{data.issuerContact}</span></p>
                  <p>Quantity: <span className="font-medium text-gray-900">{data.quantity}</span></p>
                  {data.returnDate && (
                    <p>Return Date: <span className="font-medium text-gray-900">{formatDate(data.returnDate)}</span></p>
                  )}
                  <p>
                    Status:{' '}
                    <span className={`badge badge-outline badge-${statusColorMap[data.currentStatus] || 'neutral'}`}>
                      {data.currentStatus}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">History</h4>
                <div className="pl-8 border-l-2 border-gray-200">
                  {data.history?.map((entry: HistoryEntry, idx: number) => (
                    <div key={idx} className="mb-6 relative">
                      <span
                        className={`
                          absolute -left-4 top-1.5 
                          w-3 h-3 rounded-full 
                          border-2 border-white shadow-md 
                          ${statusDotColorMap[entry.action] || 'bg-gray-400'}
                        `}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{entry.action}</div>
                        <div className="text-xs text-gray-700">{entry.actionDescription}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && !error && !data && (
            <p className="text-center text-gray-600">No transaction data found.</p>
          )}
        </div>

        {(data?.IsOwner && data.currentStatus === 'Requested') && (
          <div className="flex border-t p-4 bg-indigo-50 gap-4">
            <button onClick={handleApprove} disabled={actionLoading} className="flex-1 btn btn-success">
              {actionLoading ? 'Approving...' : 'Approve'}
            </button>
            <button onClick={handleReject} disabled={actionLoading} className="flex-1 btn btn-error">
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}

        {(data?.IsOwner && data.currentStatus === 'Approved') && (
          <div className="flex border-t p-4 bg-indigo-50 gap-4">
            <button onClick={handleIssue} disabled={actionLoading} className="flex-1 btn btn-primary">
              {actionLoading ? 'Issuing...' : 'Issue Item'}
            </button>
            <button onClick={handleReject} disabled={actionLoading} className="flex-1 btn btn-error">
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        )}

        {(data?.IsOwner && ['Assigned to Project', 'Issued', 'Overdue'].includes(data.currentStatus)) && (
          <div className="border-t p-4 bg-indigo-50">
            <button
              onClick={handleReturn}
              disabled={returnLoading}
              className="w-full btn btn-warning"
            >
              {returnLoading ? 'Returning...' : 'Return Item'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailModal;
