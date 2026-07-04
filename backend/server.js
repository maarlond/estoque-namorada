require("dotenv").config();
const db = require("./config/dataBase.js");
const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());

const authRouter = require("./routes/auth");
const produtosRouter = require("./routes/produtos");
const vendasRouter = require("./routes/vendas");

// ── CATÁLOGO PÚBLICO (sem token) ──────────────────
app.get("/catalogo", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/catalogo.html"));
});

app.get("/pages/verificar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/verificar.html"));
});

app.get("/catalogo/produtos", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        nome,
        codigo,
        marca,
        quantidade,
        descricao,
        preco_venda,
        preco_promocional,
        promocao_ativa,
        imagemproduto
      FROM produtos
      WHERE quantidade > 0
      ORDER BY id DESC
    `);

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro listar catálogo:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── ROTAS PROTEGIDAS ──────────────────────────────
app.use("/", authRouter);
app.use("/produtos", produtosRouter);
app.use("/vendas", vendasRouter);

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
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
