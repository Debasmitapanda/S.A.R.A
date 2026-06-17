require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const adminRoutes = require("./routes/adminRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const mlRoutes = require("./routes/mlRoutes");
const amendRoutes = require("./routes/amendRoutes");

// CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], // frontend vite URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Default route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Admin routes
app.use("/api/admin", adminRoutes);

//Comments Routes
app.use("/api/comments",commentsRoutes)

//ML routes
app.use("/api/ml",mlRoutes)

//Amendment Routes
app.use("/api/amend",amendRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
