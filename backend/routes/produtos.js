const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth.js");
const db = require("../config/dataBase.js");
const upload = require("../middleware/multer"); // <- multer agora
const cloudinary = require("../middleware/upload"); // <- cloudinary
const { PassThrough } = require("stream");

// ── LISTAR PRODUTOS ──
router.get("/produtos", verificarToken, (req, res) => {
  db.query("SELECT * FROM produtos", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ── ADICIONAR PRODUTO ──
router.post(
  "/produtos",
  verificarToken,
  upload.single("imagemProduto"), // multer
  async (req, res) => {
    try {
      const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
        req.body;

      let imagemProduto = null;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "produtos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          const bufferStream = require("stream").PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });
        imagemProduto = result.secure_url;
      }

      db.query(
        `INSERT INTO produtos (nome, codigo, marca, quantidade, preco_custo, preco_venda, imagemProduto) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ── EDITAR PRODUTO ──
router.put(
  "/produtos/:id",
  verificarToken,
  upload.single("imagemProduto"), // multer para receber arquivo
  async (req, res) => {
    const id = req.params.id;
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } =
      req.body;

    try {
      let imagemProduto = null;

      // se o usuário enviou uma nova imagem
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "produtos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );
          const bufferStream = require("stream").PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });
        imagemProduto = result.secure_url;
      }

      // monta query dinamicamente: se tiver imagem, atualiza também
      let query = `UPDATE produtos SET nome=?, codigo=?, marca=?, quantidade=?, preco_custo=?, preco_venda=?`;
      const params = [
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
      ];

      if (imagemProduto) {
        query += `, imagemProduto=?`;
        params.push(imagemProduto);
      }

      query += ` WHERE id=?`;
      params.push(id);

      db.query(query, params, (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Produto atualizado!" });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// ── REMOVER PRODUTO ──
router.delete("/produtos/:id", verificarToken, (req, res) => {
  db.query("DELETE FROM produtos WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Produto removido!" });
  });
});

module.exports = router;
