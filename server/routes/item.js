const express = require("express");
const { verifyToken } = require("../middleware/auth.js");
const { GetItemInfo,checkItemOwner,GetallItem} = require("../controllers/Item.js");

const router = express.Router();

router.get("/info/:id", verifyToken, GetItemInfo); 
router.get("/check-owner/:id", verifyToken, checkItemOwner);
router.get("/all", verifyToken, GetallItem);
module.exports = router;
 