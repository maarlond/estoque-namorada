const express = require("express");
const router = express.Router();
const verificarToken = require("../middleware/auth");
const db = require("../config/dataBase.js"); // importe seu db aqui, se necessário

// 💰 CRIAR VENDA
router.post("/vendas", verificarToken, (req, res) => {
  console.log("entrou criar vendaaaa");
  const { cliente, forma_pagamento, observacao, total, data_venda, itens } =
    req.body;

  console.log("📦 Payload recebido:", JSON.stringify(req.body, null, 2)); // ← ADD

  db.beginTransaction(async (errTx) => {
    if (errTx) return res.status(500).json({ error: errTx.message });

    try {
      // 1. Inserir venda
      const [result] = await db
        .promise()
        .query(
          `INSERT INTO vendas (cliente, forma_pagamento, observacao, total, data_venda) VALUES (?, ?, ?, ?, ?)`,
          [cliente, forma_pagamento, observacao, total, data_venda],
        );

      const vendaId = result.insertId;

      // 2. Inserir itens e baixar estoque
      for (const item of itens) {
        await db
          .promise()
          .query(
            `INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)`,
            [vendaId, item.produto_id, item.quantidade, item.preco_unitario],
          );
        await db
          .promise()
          .query(
            `UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?`,
            [item.quantidade, item.produto_id],
          );
      }

      // 3. Commit
      db.commit((errCommit) => {
        if (errCommit) {
          return db.rollback(() =>
            res.status(500).json({ error: errCommit.message }),
          );
        }
        res.json({ message: "Venda salva com sucesso" });
      });
    } catch (err) {
      db.rollback(() => res.status(500).json({ error: err.message }));
    }
  });
});

// =============================
// 📊 DASHBOARD
// =============================

// últimos 7 dias
router.get("/vendas/ultimos7dias", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT DATE(data_venda) as data, SUM(total) as total
      FROM vendas
      WHERE data_venda >= NOW() - INTERVAL 7 DAY
      GROUP BY DATE(data_venda)
      ORDER BY data ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pagamentos
router.get("/vendas/pagamentos", verificarToken, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT forma_pagamento, SUM(total) as total
      FROM vendas
      GROUP BY forma_pagamento
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// resumo
router.get("/vendas/resumo", verificarToken, async (req, res) => {
  try {
    const [[hoje]] = await db.promise().query(`
      SELECT SUM(total) as total 
      FROM vendas 
      WHERE DATE(data_venda) = CURDATE()
    `);
    const [[mes]] = await db.promise().query(`
      SELECT SUM(total) as total 
      FROM vendas 
      WHERE MONTH(data_venda) = MONTH(CURDATE()) 
        AND YEAR(data_venda) = YEAR(CURDATE())
    `);
    res.json({
      hoje: hoje.total || 0,
      mes: mes.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// últimas vendas
router.get("/vendas/ultimasVendas", verificarToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [rows] = await db
      .promise()
      .query(`SELECT * FROM vendas ORDER BY data_venda DESC LIMIT ?`, [limit]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
