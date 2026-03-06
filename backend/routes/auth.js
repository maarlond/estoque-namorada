// ===============================
// IMPORTAÇÃO DAS BIBLIOTECAS
// ===============================
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// conexão com banco
const db = require("../config/dataBase.js");

// chave secreta do JWT
const SECRET = "segredo_super";

// ===============================
// ROTA DE LOGIN
// ===============================

router.post("/login", (req, res) => {

    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        // verifica se usuário existe
        if (result.length === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result[0];

        // comparar senha digitada com hash
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        // gerar token JWT
        const token = jwt.sign(
            { id: usuario.id },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({ token });

    });

});


// --- Cadastro ---
router.post("/usuarios", async (req, res) => {
    const { nome, email, senha } = req.body;

    const sqlVerifica = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sqlVerifica, [email], async (err, result) => {

        if (err) return res.status(500).json({ mensagem: "Erro no banco" });
        if (result.length > 0) return res.status(400).json({ mensagem: "E-mail já cadastrado" });

        const senhaHash = await bcrypt.hash(senha, 10);
        const sqlInserir = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
        db.query(sqlInserir, [nome, email, senhaHash], (err) => {
            if (err) return res.status(500).json({ mensagem: "Erro ao cadastrar" });
            res.status(201).json({ mensagem: "Usuário cadastrado com sucesso" });
        });
    });
});

// exportar rotas
module.exports = router;