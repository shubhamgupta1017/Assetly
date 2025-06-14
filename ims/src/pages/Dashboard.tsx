import React, { useEffect, useState } from "react";
import UrgentTable from "../components/Urgent/UrgentTable.tsx";
import TransactionModal from "../components/Modals/TransactionDetail.tsx";
import { fetchUrgentTransactions } from "../api/transaction";
import { fetchCurrentUser } from "../api/auth";

const Dashboard: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [txnData, userData] = await Promise.all([
          fetchUrgentTransactions(),
          fetchCurrentUser(),
        ]);
        setTransactions(txnData);
        setUsername(userData.name || "User");
      } catch (err) {
        setError("Unable to load dashboard. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        {username && (
          <>
            <nav className="text-sm breadcrumbs text-gray-500">
              <ul>
                <li>Dashboard</li>
                <li className="text-indigo-600 font-semibold">{username}</li>
              </ul>
            </nav>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {username}</h1>
          </>
        )}
      </div>

      {/* Urgent Actions Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-indigo-700">Urgent Actions</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="loading loading-spinner loading-lg text-indigo-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No urgent actions at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] rounded-lg">
            <UrgentTable
              data={transactions}
              onRowClick={(id) => setSelectedId(id)}
            />
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {selectedId && (
        <TransactionModal
          transactionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
