const Item = require("../models/Item");
const User = require('../models/User'); // Your User model


const GetItemInfo = async (req, res) => {
  const id = req.params.id;
  console.log("Fetching item info...", id);

  try {

    const item = await Item.findById(id);
    console.log("Fetched item:", item);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Error getting inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const checkItemOwner = async (req, res) => {
  try {
    console.log("Checking item owner for ID:", req.params.id);
    const itemId = req.params.id;
    const currentUserId = req.user.id;  

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ owner: false, message: 'Item not found' });
    }

    const isOwner = item.ownerId.toString() === currentUserId;
    console.log("Is current user owner:", isOwner);
    return res.status(200).json({ owner: isOwner });
  } catch (error) {
    console.error('Error checking item owner:', error);
    res.status(500).json({ owner: false, message: 'Internal server error' });
  }
};

const GetallItem = async (req, res) => {
  console.log("Getting all items...");
  try {
    const items = await Item.find({}).populate('ownerId', 'name'); // only select name field
    
    const formattedItems = items.map(item => ({
      ...item.toObject(),
      ownerName: item.ownerId.name ,
    }));

    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { GetItemInfo,checkItemOwner,GetallItem };