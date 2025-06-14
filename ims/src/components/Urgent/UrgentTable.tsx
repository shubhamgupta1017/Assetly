import React from 'react';
import type { RecordRow } from '../../types/recordRow';

const statusColors: Record<string, string> = {
  Issued: 'bg-green-100 text-green-700',
  AssignedToProject: 'bg-blue-100 text-blue-700',
  Requested: 'bg-purple-100 text-purple-700',
  Approved: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700',
  Returned: 'bg-gray-200 text-gray-700',
  Rejected: 'bg-red-200 text-red-700',
};

const statusDisplayName: Record<string, string> = {
  Issued: 'Issued',
  AssignedToProject: 'Assigned to Project',
  Requested: 'Requested',
  Approved: 'Approved',
  Overdue: 'Overdue',
  Returned: 'Returned',
  Rejected: 'Rejected',
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

interface Props {
  data: RecordRow[];
  onRowClick: (transactionId: string) => void;
}

const UrgentTable: React.FC<Props> = ({ data, onRowClick }) => {
  return (
    <div className="text-gray-900">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((row) => {
          const colorClass = statusColors[row.status] || 'bg-gray-200 text-gray-700';
          const displayStatus = statusDisplayName[row.status] || row.status;

          return (
            <div
              key={row._id}
              onClick={() => onRowClick(row._id)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onRowClick(row._id)}
              className="relative cursor-pointer bg-white border-l-4 border-red-500 rounded-xl p-5 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <h2 className="text-lg font-semibold mb-1 truncate">{row.itemName}</h2>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Owner:</span> {row.ownerName}
              </p>

              <div className="space-y-1 text-sm text-gray-800 font-medium">
                <p><span className="inline-block w-28">Issuer:</span> {row.issuerName}</p>
                <p><span className="inline-block w-28">Quantity:</span> {row.quantity}</p>
                <p><span className="inline-block w-28">Return Date:</span> {formatDate(row.returnDate)}</p>
                <p><span className="inline-block w-28">Reason:</span> {row.reason || '-'}</p>
              </div>

              <span
                className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
              >
                {displayStatus}
              </span>
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center text-gray-500 mt-12 text-lg font-medium">
          No urgent records to display.
        </div>
      )}
    </div>
  );
};

export default UrgentTable;
