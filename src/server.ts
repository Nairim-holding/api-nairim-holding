import express from "express";
import routes from "./routes";
import prisma from "../prisma/client";
import connectBD from "./config/db";
import cors from 'cors';
import path from "path";

connectBD(prisma);

export const app = express();
app.use(cors());

console.log('Static files path:', path.resolve(__dirname, '../public'));
app.use(express.static(path.resolve(__dirname, '../public')));

// Rotas temporárias para teste
app.get('/ping', (req, res) => {
  res.send('pong');
});

routes(app);
const PORT = process.env.PORT  || 8000;

app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// app.get('/', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
// });
