import React, { useState, useMemo } from 'react';
import type { RecordRow } from '../../types/recordRow';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  data: RecordRow[];
  onRowClick: (transactionId: string) => void;
}

const statusColors: Record<string, string> = {
  Issued: 'bg-green-100 text-green-700',
  "Assigned to Project": 'bg-blue-100 text-blue-700',
  Requested: 'bg-purple-100 text-purple-700',
  Approved: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-orange-100 text-orange-700',
  Returned: 'bg-gray-200 text-gray-700',
  Rejected: 'bg-red-100 text-red-700',
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

const formatDate = (date: string | Date | null | undefined) => {
  if (!date || date === '-' || isNaN(new Date(date).getTime())) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const RecordTable: React.FC<Props> = ({ data, onRowClick }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof RecordRow | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'ownerName' | 'issuerName'>('none');

  const toggleSort = (key: keyof RecordRow) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const renderSortIcon = (key: keyof RecordRow) => {
    if (sortKey !== key) return null;
    return sortAsc ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />;
  };

  const filteredData = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    const result = data.filter((row) => {
      const matchesSearch = Object.values(row).some((val) =>
        String(val).toLowerCase().includes(lowerSearch)
      );
      const matchesStatus = statusFilter ? row.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });

    if (!sortKey) return result;

    return result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [data, search, sortKey, sortAsc, statusFilter]);

  const groupedData = useMemo(() => {
    if (groupBy === 'none') return { All: filteredData };
    return filteredData.reduce((acc, row) => {
      const key = row[groupBy] || 'Unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {} as Record<string, RecordRow[]>);
  }, [filteredData, groupBy]);

  return (
    <div className="space-y-4 text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 flex-wrap">
        <input
          type="text"
          placeholder="Search by any field..."
          className="max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {Object.keys(statusDisplayName).map((status) => (
            <option key={status} value={status}>
              {statusDisplayName[status]}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as 'none' | 'ownerName' | 'issuerName')}
        >
          <option value="none">No Filter</option>
          <option value="ownerName">Group by Owner</option>
          <option value="issuerName">Group by Issuer</option>
        </select>
      </div>

      {Object.entries(groupedData).map(([groupName, rows]) => (
        <div key={groupName} className="space-y-2">
          {groupBy !== 'none' && (
            <h3 className="text-lg font-semibold text-gray-700 mt-6 border-b pb-1">{groupName}</h3>
          )}

          <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
            <table className="min-w-full text-sm  text-center">
              <thead className="bg-gray-100 text-gray-700 text-sm font-semibold tracking-wide uppercase">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('itemName')}>
                    Item Name {renderSortIcon('itemName')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('ownerName')}>
                    Owner {renderSortIcon('ownerName')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('issuerName')}>
                    Issuer {renderSortIcon('issuerName')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('quantity')}>
                    Quantity {renderSortIcon('quantity')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('status')}>
                    Status {renderSortIcon('status')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => toggleSort('returnDate')}>
                    Return Date {renderSortIcon('returnDate')}
                  </th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.map((row) => {
                  const colorClass = statusColors[row.status] || 'bg-gray-200 text-gray-700';
                  const displayStatus = statusDisplayName[row.status] || row.status;

                  return (
                    <tr
                      key={row._id}
                      onClick={() => onRowClick(row._id)}
                      className="cursor-pointer hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.itemName}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.ownerName}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{row.issuerName}</td>
                      <td className="px-4 py-3 text-gray-700">{row.quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(row.returnDate)}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{row.reason || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordTable;
