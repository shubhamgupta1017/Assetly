const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { getInventoryItemsByOwnerId,createInventoryItem ,deleteInventoryItem, updateInventoryItem} = require("../controllers/inventory");

const router = express.Router();

router.get("/byowner", verifyToken, getInventoryItemsByOwnerId); // protected route
router.post("/add", verifyToken, createInventoryItem); // protected route
router.delete("/delete/:id", verifyToken, deleteInventoryItem); // protected route
router.put("/update/:id", verifyToken, updateInventoryItem); // protected route
module.exports = router;
