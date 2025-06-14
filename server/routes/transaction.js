const express = require("express");
const { verifyToken } = require("../middleware/auth.js");
const { getUrgentTransactions,getAllTransactions,addToProject, requestItem, getItemTransactions ,getTransactionDetails, moveReturnDate, returnItem, approveRequest, rejectTransaction, issueItem} = require("../controllers/transaction.js");

const router = express.Router();

router.post("/addtoproject", verifyToken, addToProject); 
router.post("/requestitem", verifyToken, requestItem);
router.get("/gettransaction/:id", verifyToken, getItemTransactions);
router.get("/gettransactiondetails/:transactionId", verifyToken, getTransactionDetails);
router.post("/movereturndate", verifyToken, moveReturnDate);
router.post("/returnitem", verifyToken, returnItem);    
router.post("/approvetransaction", verifyToken, approveRequest);
router.post("/rejecttransaction", verifyToken, rejectTransaction);
router.post("/issueitem", verifyToken,issueItem);
router.get("/getalltransactions", verifyToken, getAllTransactions);
router.get("/geturgenttransactions", verifyToken, getUrgentTransactions);
module.exports = router;
 