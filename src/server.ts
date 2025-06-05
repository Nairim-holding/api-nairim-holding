import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";
import cors from 'cors';
import path from "path";

connectBD(prisma);

export const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
});
routes(app);
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});