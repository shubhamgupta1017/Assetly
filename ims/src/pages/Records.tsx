import React, { useState, useEffect, useCallback } from 'react';
import RecordTable from "../components/Record/RecordTable.tsx";
import TransactionModal from '../components/Modals/TransactionDetail.tsx';
import { fetchMyTransactions } from '../api/transaction'; 

const RecordPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyTransactions();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-4xl font-bold text-black">Records</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <RecordTable data={transactions} onRowClick={(id) => setSelectedId(id)} />
      )}

      {selectedId && (
        <TransactionModal
          transactionId={selectedId}
          onClose={() => {
            setSelectedId(null);
            loadTransactions(); // ✅ reload only table data on modal close
          }}
        />
      )}
    </div>
  );
};

export default RecordPage;
