import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getItemInfo, checkItemOwner } from '../api/item';
import { fetchTransactionsForItem } from '../api/transaction';
import type { TransactionRow } from '../types/transaction';

import TransactionTable from '../components/Item/TransactionTable';
import IssueToProjectModal from '../components/Modals/IssueToProject';
import RequestModal from '../components/Modals/Request';
import TransactionDetailModal from '../components/Modals/TransactionDetail';

const ItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showIssuerModal, setShowIssueModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const [itemData, ownerStatus, transactionData] = await Promise.all([
        getItemInfo(id),
        checkItemOwner(id),
        fetchTransactionsForItem(id),
      ]);

      if (!itemData) {
        setError('Item not found.');
        setItem(null);
        setTransactions([]);
        setIsOwner(false);
      } else {
        setItem(itemData);
        setIsOwner(ownerStatus);
        setTransactions(transactionData);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load item data.');
      setItem(null);
      setTransactions([]);
      setIsOwner(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refreshItemQuantitiesAndTransactions = useCallback(async () => {
    if (!id) return;
    try {
      const [itemData, transactionData] = await Promise.all([
        getItemInfo(id),
        fetchTransactionsForItem(id),
      ]);
      setItem(itemData);
      setTransactions(transactionData);
    } catch (e) {
      console.error("Failed to refresh partial data:", e);
    }
  }, [id]);

  const refreshTransactions = useCallback(async () => {
    if (!id) return;
    try {
      const transactionData = await fetchTransactionsForItem(id);
      setTransactions(transactionData);
    } catch (e) {
      console.error("Failed to refresh transactions:", e);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-center text-lg font-medium">
        Loading item data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 text-center text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">{item.itemName}</h1>

      {/* Quantity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-xl p-4 border-l-[6px] border-blue-600">
          <p className="text-sm text-gray-600 mb-1 font-medium">Total Quantity</p>
          <p className="text-2xl font-bold text-blue-800">{item.totalQuantity}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-[6px] border-green-600">
          <p className="text-sm text-gray-600 mb-1 font-medium">Available Quantity</p>
          <p className="text-2xl font-bold text-green-800">{item.availableQuantity}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-[6px] border-yellow-500">
          <p className="text-sm text-gray-600 mb-1 font-medium">Issued Quantity</p>
          <p className="text-2xl font-bold text-yellow-600">{item.issuedQuantity}</p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border-l-[6px] border-purple-600">
          <p className="text-sm text-gray-600 mb-1 font-medium">Project Quantity</p>
          <p className="text-2xl font-bold text-purple-700">{item.projectQuantity}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-10">
        {isOwner ? (
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition focus:outline-none"
          >
            Assign Item to Project
          </button>
        ) : (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-md transition focus:outline-none"
          >
            Request Item
          </button>
        )}
      </div>

      {/* Modals */}
      {showIssuerModal && (
        <IssueToProjectModal
          itemId={item._id}
          onClose={() => {
            setShowIssueModal(false);
            refreshItemQuantitiesAndTransactions(); // ✅ only partial reload
          }}
        />
      )}

      {showRequestModal && (
        <RequestModal
          itemId={item._id}
          onClose={() => {
            setShowRequestModal(false);
            refreshItemQuantitiesAndTransactions(); // ✅
          }}
        />
      )}

      {/* Transactions Table */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 tracking-tight">
          Active Records
        </h2>
        <TransactionTable
          data={transactions}
          onRowClick={(transactionId) => setSelectedTransactionId(transactionId)}
        />
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransactionId && (
        <TransactionDetailModal
          transactionId={selectedTransactionId}
          onClose={() => {
            setSelectedTransactionId(null);
            refreshTransactions(); // ✅ reload only the table
          }}
        />
      )}
    </div>
  );
};

export default ItemPage;
