import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";

connectBD(prisma);

export const app = express();
routes(app);
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
