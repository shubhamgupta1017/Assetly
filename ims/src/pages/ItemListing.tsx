import React, { useEffect, useState, useMemo } from 'react';
import { fetchAllItems } from '../api/item';
import { useNavigate } from 'react-router-dom';

interface Item {
  _id: string;
  itemName: string;
  ownerName: string;
  availableQuantity: number;
  issuedQuantity: number;
  projectQuantity: number;
}

type SortKey = keyof Item | 'totalQuantity';

const ProductPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('itemName');
  const [sortAsc, setSortAsc] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllItems()
      .then(setItems)
      .catch(() => setError('Failed to load items'))
      .finally(() => setLoading(false));
  }, []);

  const uniqueOwners = useMemo(() => {
    const owners = items.map(item => item.ownerName);
    return ['All', ...Array.from(new Set(owners))];
  }, [items]);

  const handleSort = (key: SortKey) => {
  if (sortKey === key) {
    setSortAsc(!sortAsc);
  } else {
    setSortKey(key);
    setSortAsc(false); // Descending first
  }
};


  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch =
          item.itemName.toLowerCase().includes(search.toLowerCase()) ||
          item.ownerName.toLowerCase().includes(search.toLowerCase());

        const matchesOwner =
          ownerFilter === 'All' || item.ownerName === ownerFilter;

        return matchesSearch && matchesOwner;
      })
      .sort((a, b) => {
        const aValue = sortKey === 'totalQuantity'
          ? a.availableQuantity + a.issuedQuantity + a.projectQuantity
          : a[sortKey];
        const bValue = sortKey === 'totalQuantity'
          ? b.availableQuantity + b.issuedQuantity + b.projectQuantity
          : b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortAsc
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortAsc
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
  }, [items, search, ownerFilter, sortKey, sortAsc]);

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortAsc ? '↑' : '↓') : '';

  if (loading) return <div className="p-6 text-center text-gray-500 text-lg">Loading items...</div>;
  if (error) return <div className="p-6 text-center text-red-600 font-medium">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Product Inventory</h1>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by item or owner..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
        <select
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        >
          {uniqueOwners.map(owner => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>
      </div>

      {/* Sort Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        {(['itemName', 'ownerName', 'availableQuantity', 'issuedQuantity', 'projectQuantity', 'totalQuantity'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-4 py-2 rounded-md font-medium border transition-all duration-150 ease-in-out
              ${sortKey === key
                ? 'border-green-600 bg-green-100 text-green-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-green-50 hover:border-green-500'
              }`}
          >
            {key === 'itemName' && 'Item Name'}
            {key === 'ownerName' && 'Owner Name'}
            {key === 'availableQuantity' && 'Available'}
            {key === 'issuedQuantity' && 'Issued'}
            {key === 'projectQuantity' && 'In Project'}
            {key === 'totalQuantity' && 'Total'}
            {' '}
            {sortIndicator(key)}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const totalQuantity = item.availableQuantity + item.issuedQuantity + item.projectQuantity;
          return (
            <div
              key={item._id}
              onClick={() => navigate(`/item/${item._id}`)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/item/${item._id}`)}
              className="cursor-pointer bg-white border-l-4 border-green-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <h2 className="text-xl font-semibold mb-1 truncate">{item.itemName}</h2>
              <p className="text-sm text-gray-600 mb-4"><span className="font-medium">{item.ownerName}</span></p>

              <div className="space-y-1 text-sm text-gray-800 font-medium">
                <p><span className="inline-block w-28 text-green-700">Available:</span> {item.availableQuantity}</p>
                <p><span className="inline-block w-28 text-blue-700">Issued:</span> {item.issuedQuantity}</p>
                <p><span className="inline-block w-28 text-yellow-700">In Project:</span> {item.projectQuantity}</p>
                <p className="border-t pt-2 mt-2 text-black font-semibold">
                  <span className="inline-block w-28">Total:</span> {totalQuantity}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center text-gray-500 mt-12 text-lg font-medium">
          No items match your filters.
        </div>
      )}
    </div>
  );
};

export default ProductPage;
