const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth.js");
const db = require("../config/dataBase.js"); // importe seu db aqui, se necessário
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // pasta onde salva
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + "-" + file.originalname;
    cb(null, nomeArquivo);
  },
});

const upload = multer({ storage });

// Listar produtos
router.get("/produtos", verificarToken, (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// Adicionar produto
router.post(
  "/produtos",
  verificarToken,
  upload.single("imagemProduto"),
  (req, res) => {
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
      req.body;

    // caminho da imagem salva
    const imagemProduto = req.file ? `/uploads/${req.file.filename}` : null;

    db.query(
      "INSERT INTO produtos (nome, codigo, marca, quantidade, preco_custo, preco_venda, imagemProduto) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
        imagemProduto,
      ],
      (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Produto cadastrado!" });
      },
    );
  },
);

// Editar produto
router.put("/produtos/:id", (req, res) => {
  const id = req.params.id;
  const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
    req.body;

  db.query(
    `UPDATE produtos
         SET nome=?, codigo=?, marca=?, quantidade=?, preco_custo=?, preco_venda=?
         WHERE id=?`,
    [nome, codigo, marca, quantidade, preco_custo, preco_venda, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Produto atualizado!" });
    },
  );
});

// Remover produto
router.delete("/produtos/:id", (req, res) => {
  db.query("DELETE FROM produtos WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produto removido!" });
  });
});

module.exports = router;
