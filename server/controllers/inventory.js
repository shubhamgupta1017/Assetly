const Item = require("../models/Item");


const getInventoryItemsByOwnerId = async (req, res) => {
  try {
    const ownerId = req.user.id; 
    const items = await Item.find({ ownerId });
    console.log("Fetched items by owner id:", items);
    res.status(200).json({ items });
  } catch (error) {
    console.error("Failed to fetch items:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



const createInventoryItem = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { itemName, totalQuantity } = req.body;

    // Validate input
    if (!itemName || typeof totalQuantity !== 'number') {
      return res.status(400).json({ message: 'Item name and valid quantity are required.' });
    }

    if (totalQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be non-negative.' });
    }

    // Check for existing item with same name and owner
    const existingItem = await Item.findOne({ itemName, ownerId });
    if (existingItem) {
      return res.status(409).json({ message: 'Item with this name already exists for the user.' });
    }

    // Create item
    const newItem = new Item({
      itemName,
      totalQuantity,
      availableQuantity: totalQuantity,
      issuedQuantity: 0,
      projectQuantity: 0,
      ownerId
    });

    await newItem.save();

    console.log('Created new item:', newItem);
    return res.status(201).json({ item: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    return res.status(500).json({ message: 'Server error while creating item.' });
  }
};


const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.availableQuantity !== item.totalQuantity) {
      return res.status(400).json({
        message: "Cannot delete item: some quantity is issued or in project"
      });
    }

    await Item.findByIdAndDelete(id);
    res.status(200).json({ message: "Item deleted successfully" });

  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateInventoryItem = async (req, res) => {
  console.log("Updating inventory item with body:", req.body);
  const { id } = req.params;
  const { changeInQuantity, itemName } = req.body;

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update itemName if provided
    if (itemName) {
      item.itemName = itemName;
    }

    // Handle quantity change if provided

      console.log("Change in quantity:", changeInQuantity);
      const newAvailableQuantity = item.availableQuantity + changeInQuantity;
      const newTotalQuantity = item.totalQuantity + changeInQuantity;

      // Validate quantities
      if (newAvailableQuantity < 0) {
        return res.status(400).json({ message: 'Insufficient available quantity' });
      }
      if (newTotalQuantity < newAvailableQuantity) {
        return res.status(400).json({ message: 'Total quantity cannot be less than available quantity' });
      }
      if (newTotalQuantity <= 0) {
        return res.status(400).json({ message: 'Total quantity cannot be negative or zero' });
      }

      // Update quantities
      item.availableQuantity = newAvailableQuantity;
      item.totalQuantity = newTotalQuantity;
    

    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = { getInventoryItemsByOwnerId ,createInventoryItem ,deleteInventoryItem, updateInventoryItem };
