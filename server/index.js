require("dotenv").config();
require("./utils/passport");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const inventoryRoutes = require("./routes/myInventory");
const itemRoutes = require("./routes/item");
const transactionRoutes = require("./routes/transaction");

const app = express();
app.use(express.json());
app.use(cookieParser());
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

app.set("trust proxy", 1); // Important for secure cookies

app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.JWT_SECRET, 
  resave: false,
  saveUninitialized: true
}));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,        // required for SameSite: 'None'
    sameSite: 'None'     // allows cross-origin
  }
}));
app.use(passport.initialize());
app.use(passport.session());



app.use("/auth", require("./routes/auth")); 

app.use("/api/inventory", inventoryRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/transaction", transactionRoutes);

const PORT = process.env.PORT 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
