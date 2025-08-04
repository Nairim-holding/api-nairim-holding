import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";
import cors from 'cors';
import path from "path";

connectBD(prisma);

export const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname,'..', 'public')));
routes(app);
const PORT = 5000;

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});