const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth.js");
const db = require("../config/dataBase.js");
const upload = require("../middleware/multer");
const cloudinary = require("../middleware/upload");
const { PassThrough } = require("stream");

// =============================
// 📦 LISTAR PRODUTOS
// =============================
router.get("/produtos", verificarToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM produtos");

    res.json(result.rows || []);
  } catch (err) {
    console.error("Erro listar produtos:", err);
    res.status(500).json({ error: err.message });
  }
});

// =============================
// ➕ ADICIONAR PRODUTO
// =============================
// =============================
// ➕ ADICIONAR PRODUTO
// =============================
router.post(
  "/produtos",
  verificarToken,
  upload.single("imagemProduto"),
  async (req, res) => {
    try {
      console.log("BODY PRODUTO:", req.body);
      console.log("ARQUIVO:", req.file ? req.file.originalname : "sem imagem");
      const {
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
        descricao,
        status_entrega,
      } = req.body;

      const promocao_ativa =
        req.body.promocao_ativa === "true" || req.body.promocao_ativa === true;

      const preco_promocional =
        req.body.preco_promocional &&
        req.body.preco_promocional !== "null" &&
        req.body.preco_promocional !== "undefined"
          ? Number(req.body.preco_promocional)
          : null;

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

          const bufferStream = new PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });

        imagemProduto = result.secure_url;
      }

      await db.query(
        `INSERT INTO produtos
        (
          nome,
          codigo,
          marca,
          quantidade,
          preco_custo,
          preco_venda,
          descricao,
          imagemproduto,
          promocao_ativa,
          preco_promocional,
          status_entrega
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          nome,
          codigo,
          marca,
          Number(quantidade),
          Number(preco_custo),
          Number(preco_venda),
          descricao || null,
          imagemProduto,
          promocao_ativa,
          preco_promocional,
          status_entrega || "pronta_entrega",
        ],
      );

      res.json({ message: "Produto cadastrado!" });
    } catch (err) {
      console.error("Erro criar produto:", err);
      res.status(500).json({
        error: err.message,
        detail: err.detail,
        code: err.code,
      });
    }
  },
);

// =============================
// ✏️ EDITAR PRODUTO
// =============================
// =============================
// ✏️ EDITAR PRODUTO
// =============================
router.put(
  "/produtos/:id",
  verificarToken,
  upload.single("imagemProduto"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const {
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
        descricao,
        status_entrega,
      } = req.body;

      const promocao_ativa =
        req.body.promocao_ativa === "true" || req.body.promocao_ativa === true;

      const preco_promocional =
        req.body.preco_promocional &&
        req.body.preco_promocional !== "null" &&
        req.body.preco_promocional !== "undefined"
          ? Number(req.body.preco_promocional)
          : null;

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

          const bufferStream = new PassThrough();
          bufferStream.end(req.file.buffer);
          bufferStream.pipe(stream);
        });

        imagemProduto = result.secure_url;
      }

      let query = `
        UPDATE produtos
        SET nome = $1,
            codigo = $2,
            marca = $3,
            quantidade = $4,
            preco_custo = $5,
            preco_venda = $6,
            descricao = $7,
            promocao_ativa = $8,
            preco_promocional = $9,
            status_entrega = $10
      `;

      const params = [
        nome,
        codigo,
        marca,
        Number(quantidade),
        Number(preco_custo),
        Number(preco_venda),
        descricao || null,
        promocao_ativa,
        preco_promocional,
        status_entrega || "pronta_entrega",
      ];

      if (imagemProduto) {
        query += `, imagemproduto = $11 WHERE id = $12`;
        params.push(imagemProduto, id);
      } else {
        query += ` WHERE id = $11`;
        params.push(id);
      }

      await db.query(query, params);

      res.json({ message: "Produto atualizado!" });
    } catch (err) {
      console.error("Erro atualizar produto:", err);
      res.status(500).json({ error: err.message });
    }
  },
);
// =============================
// 🗑️ REMOVER PRODUTO
// =============================
router.delete("/produtos/:id", verificarToken, async (req, res) => {
  try {
    await db.query("DELETE FROM produtos WHERE id = $1", [req.params.id]);

    res.json({ message: "Produto removido!" });
  } catch (err) {
    console.error("Erro remover produto:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
