import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";
import cors from 'cors';

connectBD(prisma);

export const app = express();
app.use(cors());
routes(app);
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
