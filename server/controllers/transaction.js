const Transaction = require("../models/Transaction");
const Item = require("../models/Item");
const User = require("../models/User"); // Assuming you have a User model to fetch user details

const addToProject = async (req, res) => {
  try {
    const { itemId, quantity, reason } = req.body;
    const issuerId = req.user?.id;
    const ownerId = req.user?.id; // Assuming the owner is also the logged-in user

    console.log('Received addToProject request:', { itemId, quantity, reason, issuerId });

    // 1. Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // 2. Check ownership
    if (ownerId !== item.ownerId.toString()) {
      return res.status(403).json({ message: 'You do not have permission to assign this item to a project' });
    }

    // 3. Check quantity
    if (item.availableQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient available quantity' });
    }

    // 4. Create transaction
    const transaction = new Transaction({
      itemUID: item._id,
      ownerId: item.ownerId,
      issuerId,
      currentStatus: "Assigned to Project",
      reason,
      quantity: quantity,
      history: [{
        action: "Assigned to Project",
        actionDescription: `Assigned ${quantity} ${item.itemName} to project`,
        date: new Date()
      }]
    });

    await transaction.save();

    // 5. Update item counts
    item.availableQuantity -= quantity;
    item.projectQuantity += quantity;
    await item.save();

    res.status(200).json({ message: 'Item assigned to project successfully', transaction });
  } catch (error) {
    console.error('Error in addToProject:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const { sendRequestMail } = require('../cron/overdueChecker.js');

const requestItem = async (req, res) => {
  try {
    const { itemId, quantity, reason, returnDate } = req.body;
    const issuerId = req.user.id;

    console.log('Received requestItem request:', { itemId, quantity, reason, returnDate, issuerId });

    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if(!returnDate || !quantity || !reason) {
      return res.status(400).json({ message: 'Return date, quantity, and reason are required' });
    }
    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Optional: Validate return date is in the future
    if (returnDate && new Date(returnDate) < new Date()) {
      return res.status(400).json({ message: 'Return date must be in the future' });
    }

    // Create transaction
    const transaction = new Transaction({
      itemUID: item._id,
      ownerId: item.ownerId,
      issuerId,
      currentStatus: "Requested",
      reason,
      returnDate: returnDate,
      quantity: quantity,
      history: [{
        action: "Requested",
        actionDescription: `Requested ${quantity} ${item.itemName}`,
        date: new Date()
      }]
    });

    // Send request email
    await transaction.save();
    sendRequestMail(transaction,issuerId);

    res.status(200).json({ message: 'Item request submitted successfully', transaction });
  } catch (error) {
    console.error('Error in requestItem:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getItemTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("➡️  getItemTransactions called with itemId:", id);

    const validStatuses = ["Issued", "Requested", "Assigned to Project","Overdue","Approved"];
    console.log("✅ Valid statuses:", validStatuses);

    const transactions = await Transaction.find({
      itemUID: id,
      currentStatus: { $in: validStatuses }
    }).populate('itemUID');

    console.log("📦 Transactions fetched:", transactions.length);

    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const issuer = await User.findById(t.issuerId);
        const enrichedTransaction = {
          _id: t._id,
          issuerName: issuer?.name || 'Unknown',
          quantity: t.quantity,
          status: t.currentStatus,
          returnDate: t.returnDate ? new Date(t.returnDate).toLocaleDateString() : 'N/A',
          reason: t.reason || 'N/A'
        };
        console.log("🔹 Enriched transaction:", enrichedTransaction);
        return enrichedTransaction;
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error("❌ Error fetching item transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getTransactionDetails = async (req, res) => {
  try {
    const transactionId = req.params.transactionId;
    const currentUserId = req.user.id; // from auth middleware
    console.log('Received getTransactionDetails request for transactionId:', transactionId);
    const transaction = await Transaction.findById(transactionId).lean();
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const owner= await User.findById(transaction.ownerId).lean();
    const issuer = await User.findById(transaction.issuerId).lean();
    const item = await Item.findById(transaction.itemUID).lean();
    const itemName = item.name ;

    const formattedReturnDate = transaction.returnDate
      ? transaction.returnDate.toISOString().slice(0, 10)
      : '';

    const formattedHistory = (transaction.history || []).map((step) => ({
      action: step.action,
      actionDescription: step.actionDescription,
      date: step.date ? step.date.toISOString().slice(0, 10) : '',
    }));

    // Prepare response JSON
    const responseData = {
      itemName: item.itemName,
      ownerName: owner.name,
      issuerName: issuer.name,
      issuerContact: issuer.contactNumber,
      IsOwner: transaction.ownerId === currentUserId,
      quantity: transaction.quantity,
      currentStatus: transaction.currentStatus,
      returnDate: formattedReturnDate,
      history: formattedHistory,
    };
    console.log('Transaction details response:', responseData);
    return res.json(responseData);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const moveReturnDate = async (req, res) => {
  try {
    const { transactionId, newReturnDate } = req.body;
    const currentUserId = req.user.id;

    console.log('Received moveReturnDate request:', {
      transactionId,
      newReturnDate,
      currentUserId,
    });

    if (!transactionId || !newReturnDate) {
      return res.status(400).json({ message: 'Transaction ID and new return date are required' });
    }

    const newDate = new Date(newReturnDate);
    if (isNaN(newDate.getTime()) || newDate < new Date()) {
      return res.status(400).json({ message: 'Invalid or past return date' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to modify this transaction' });
    }

    // Format dates as dd/mm/yyyy
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const oldDate = transaction.returnDate ? formatDate(transaction.returnDate) : 'N/A';
    const updatedDate = formatDate(newDate);

    // Update return date
    transaction.returnDate = newDate;

    // Add to history
    transaction.history.push({
      action: 'Return Date Changed',
      actionDescription: `Return date updated from ${oldDate} to ${updatedDate}`,
      date: new Date(),
    });

    await transaction.save();

    res.status(200).json({ message: 'Return date updated successfully' });
  } catch (error) {
    console.error('Error updating return date:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const returnItem = async (req, res) => {
  try {
    const { transactionId} = req.body;
    const currentUserId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check ownership
    if (transaction.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Only the owner can return the item' });
    }

    // Prevent duplicate returns
    if (transaction.currentStatus !== 'Assigned to Project' && transaction.currentStatus !== 'Issued' && transaction.currentStatus !== 'Overdue') {
      return res.status(400).json({ message: 'Item not returnable' });
    }


    const item = await Item.findById(transaction.itemUID);
    if (!item) {
      return res.status(404).json({ message: 'Associated item not found' });
    }
    
    // Increase available quantity
    item.availableQuantity += transaction.quantity;

    // Decrease from issued or inProject
    if (transaction.currentStatus === 'Issued') {
      item.issuedQuantity = item.issuedQuantity - transaction.quantity;
    } else if (transaction.currentStatus === 'Assigned to Project') {
      item.projectQuantity = item.projectQuantity - transaction.quantity;
    }

    await item.save();

    // Update transaction
    transaction.currentStatus = 'Returned';
    transaction.history.push({
      action: 'Returned',
      actionDescription: `Item returned`,
      date: new Date(),
    });

    await transaction.save();

    res.status(200).json({ message: 'Item returned successfully' });
  } catch (error) {
    console.error('Error returning item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const { sendApprovalMail } = require('../cron/overdueChecker.js');
const approveRequest = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const currentUserId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if current user is the owner
    if (transaction.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }

    if (transaction.currentStatus !== 'Requested') {
      return res.status(400).json({ message: 'Only "Requested" transactions can be approved' });
    }

    const item = await Item.findById(transaction.itemUID);
    if (!item) {  
      return res.status(404).json({ message: 'Associated item not found' });
    }
    await item.save();
    transaction.currentStatus = 'Approved';
    transaction.history.push({
      action: 'Approved',
      actionDescription: 'Request Approved by owner',
      date: new Date(),
    });
    sendApprovalMail(transaction);
    await transaction.save();

    res.status(200).json({ message: 'Transaction approved successfully' });
  } catch (error) {
    console.error('Error approving transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const { sendRejectionMail } = require('../cron/overdueChecker.js');

const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const currentUserId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check ownership
    if (transaction.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    if (transaction.currentStatus !== 'Requested' && transaction.currentStatus !== 'Approved') {
      return res.status(400).json({ message: 'Only "Requested" transactions can be rejected' });
    }

    transaction.currentStatus = 'Rejected';
    transaction.history.push({
      action: 'Rejected',
      actionDescription: `Request rejected`,
      date: new Date(),
    });
    sendRejectionMail(transaction);
    await transaction.save();

    res.status(200).json({ message: 'Transaction rejected successfully' });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const issueItem = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const currentUserId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Ensure the user is the owner of the item
    if (transaction.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to issue this item' });
    }

    // Only approved transactions can be issued
    if (transaction.currentStatus !== 'Approved') {
      return res.status(400).json({ message: 'Only approved transactions can be issued' });
    }
    // change quantiity
    const item = await Item.findById(transaction.itemUID);
    if (!item) {
      return res.status(404).json({ message: 'Associated item not found' });
    }
    if (item.availableQuantity < transaction.quantity) {
      return res.status(400).json({ message: 'Insufficient available quantity to issue' });
    }
    // Update item counts
    item.availableQuantity -= transaction.quantity;
    item.issuedQuantity += transaction.quantity;
    await item.save();
    transaction.currentStatus = 'Issued';
    transaction.history.push({
      action: 'Issued',
      actionDescription: 'Item issued to the user',
      date: new Date(),
    });

    await transaction.save();

    res.status(200).json({ message: 'Item issued successfully' });
  } catch (error) {
    console.error('Error issuing item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming this is the logged-in user's googleId

    const transactions = await Transaction.find({
      $or: [{ ownerId: userId }, { issuerId: userId }],
    })
      .sort({ updatedAt: -1 }) // 🔥 Sort by most recently updated
      .populate("itemUID")
      .lean();

    const userMap = {};
    const userIds = new Set();

    // Collect unique owner and issuer IDs
    transactions.forEach((txn) => {
      userIds.add(txn.ownerId);
      userIds.add(txn.issuerId);
    });

    // Fetch all involved users
    const users = await User.find({ _id: { $in: Array.from(userIds) } });
    users.forEach((user) => {
      userMap[user._id] = user.name;
    });

    const result = transactions.map((txn) => ({
      _id: txn._id.toString(),
      itemName: txn.itemUID?.itemName || "Unknown Item",
      ownerName: userMap[txn.ownerId] || "Unknown",
      ownerId: txn.ownerId,
      issuerId: txn.issuerId,
      issuerName: userMap[txn.issuerId] || "Unknown",
      quantity: txn.quantity,
      status: txn.currentStatus,
      returnDate: txn.returnDate || "NA",
      reason: txn.reason || "",
    }));

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getUrgentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [{ ownerId: userId }, { issuerId: userId }],
      currentStatus: { $in: ['Overdue', 'Approved', 'Requested'] }, // ✅ filter urgent
    })
      .sort({ updatedAt: -1 })
      .populate("itemUID")
      .lean();

    const userMap = {};
    const userIds = new Set();

    // Collect unique user IDs
    transactions.forEach((txn) => {
      userIds.add(txn.ownerId);
      userIds.add(txn.issuerId);
    });

    // Fetch user names
    const users = await User.find({ _id: { $in: Array.from(userIds) } });
    users.forEach((user) => {
      userMap[user._id] = user.name;
    });

    // Build response
    const result = transactions.map((txn) => ({
      _id: txn._id.toString(),
      itemName: txn.itemUID?.itemName || "Unknown Item",
      ownerName: userMap[txn.ownerId] || "Unknown",
      ownerId: txn.ownerId,
      issuerId: txn.issuerId,
      issuerName: userMap[txn.issuerId] || "Unknown",
      quantity: txn.quantity,
      status: txn.currentStatus,
      returnDate: txn.returnDate || "NA",
      reason: txn.reason || "",
    }));

    console.log("🚀 Urgent transactions fetched:", result);
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getUrgentTransactions,getAllTransactions,addToProject, requestItem, getItemTransactions ,getTransactionDetails, moveReturnDate, returnItem, approveRequest, rejectTransaction, issueItem };
