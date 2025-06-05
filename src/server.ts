import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";
import cors from 'cors';
import path from "path";

connectBD(prisma);

export const app = express();
app.use(cors());

// app.use(express.static(path.resolve(__dirname, '../public')));

routes(app);

const PORT = process.env.PORT  || 5000;

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('aaaaa')
});
