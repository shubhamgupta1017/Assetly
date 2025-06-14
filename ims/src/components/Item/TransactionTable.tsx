import React from 'react';
import type { TransactionRow } from '../../types/transaction';

interface Props {
  data: TransactionRow[];
  onRowClick: (transactionId: string) => void;
}

const statusColors: Record<TransactionRow['status'], string> = {
  'Issued': 'bg-green-100 text-green-700',
  'Assigned to Project': 'bg-blue-100 text-blue-700',
  'Requested': 'bg-purple-100 text-purple-700',
  'Approved': 'bg-yellow-100 text-yellow-700',
  'Overdue': 'bg-red-100 text-red-700',
  // other: 'bg-gray-100 text-gray-700',
  'Returned': 'bg-gray-200 text-gray-700',
  'Rejected': 'bg-red-200 text-red-700',
  // Add more status mappings if needed
};

const TransactionTable: React.FC<Props> = ({ data, onRowClick }) => {
  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold tracking-wide uppercase">
          <tr>
            <th className="px-4 py-3">Issuer</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Return Date</th>
            <th className="px-4 py-3">Reason</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-6 text-gray-500 font-medium"
              >
                No Active record found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row._id}
                onClick={() => onRowClick(row._id)}
                className="cursor-pointer hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-gray-800">{row.issuerName}</td>
                <td className="px-4 py-3 text-gray-700">{row.quantity}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[row.status] || 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{row.returnDate}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{row.reason}</td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
};

export default TransactionTable;
