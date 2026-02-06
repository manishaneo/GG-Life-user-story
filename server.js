import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectDB();


app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Server running and DB connected");
});



app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});


