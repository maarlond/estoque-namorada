require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const produtosRouter = require("./routes/produtos");
const vendasRouter = require("./routes/vendas");

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// Prefixos corretos para evitar conflito
app.use("/", authRouter); // login, cadastro etc → /auth/...
app.use("/", produtosRouter); // CRUD de produtos → /produtos/...
app.use("/", vendasRouter); // CRUD de vendas → /vendas/...

// SERVER FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));
// SERVIR IMAGENS
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
