import React from 'react';
import type { MyItem } from '../../types/inventory';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';

interface InventoryTableProps {
  items: MyItem[];
  sortKey: keyof MyItem | '';
  sortAsc: boolean;
  onSort: (key: keyof MyItem) => void;
  onUpdate: (item: MyItem) => void;
  onDelete: (item: MyItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  sortKey,
  sortAsc,
  onSort,
  onUpdate,
  onDelete
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-gray-700 text-sm font-semibold tracking-wide ">
          <tr>
            <th className="px-4 py-3 text-center">Name</th>
            <th
              className="px-4 py-3 text-center cursor-pointer hover:bg-gray-200 transition"
              onClick={() => onSort('totalQuantity')}
            >
              Total {sortKey === 'totalQuantity' && (sortAsc ? '↑' : '↓')}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer hover:bg-gray-200 transition"
              onClick={() => onSort('availableQuantity')}
            >
              Available {sortKey === 'availableQuantity' && (sortAsc ? '↑' : '↓')}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer hover:bg-gray-200 transition"
              onClick={() => onSort('issuedQuantity')}
            >
              Issued {sortKey === 'issuedQuantity' && (sortAsc ? '↑' : '↓')}
            </th>
            <th
              className="px-4 py-3 text-center cursor-pointer hover:bg-gray-200 transition"
              onClick={() => onSort('projectQuantity')}
            >
              In Project {sortKey === 'projectQuantity' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500 bg-gray-50 font-medium">
                No items found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-gray-50 cursor-pointer transition"
                onClick={() => navigate(`/item/${item._id}`)}
              >
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {item.itemName}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{item.totalQuantity}</td>
                <td className="px-4 py-3 text-center">{item.availableQuantity}</td>
                <td className="px-4 py-3 text-center">{item.issuedQuantity}</td>
                <td className="px-4 py-3 text-center">{item.projectQuantity}</td>
                <td
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-3 flex justify-center gap-2"
                >
                  <button
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition"
                    title="Update"
                    onClick={() => onUpdate(item)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition"
                    title="Delete"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
