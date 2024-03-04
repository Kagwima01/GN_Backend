const dotenv = require("dotenv");
const connectToDatabase = require("./database");
const cors = require("cors");
const express = require("express");

//The routes
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const salesRoutes = require("./routes/salesRoutes");
const filtersRoutes = require("./routes/filtersRoutes");
const imageRoutes = require("./routes/imageRoutes");

dotenv.config();
connectToDatabase();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/images", imageRoutes);

app.get("/api/config/web-google", (req, res) =>
  res.send(process.env.GOOGLE_WEB_CLIENT_ID)
);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server runs on port: ${port}`);
});
