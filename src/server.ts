import express from "express";
import cors from 'cors';
import path from "path";

const app = express();

app.use(cors());

console.log('Static files path:', path.resolve(__dirname, '../public'));
app.use(express.static(path.resolve(__dirname, '../public')));

// Rotas temporárias para teste
app.get('/ping', (req, res) => {
  res.send('pong');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
