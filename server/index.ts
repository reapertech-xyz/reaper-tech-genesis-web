// server/index.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import contractRoutes from "./routes/contract";
import { Request, Response } from "express";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api/contract", contractRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Thirdweb API is live");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
