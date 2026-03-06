/*const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
// Criação de rota para login
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = "segredo_super";

const app = express();
app.use(cors());
app.use(express.json());

// SERVER FRONTEND
//app.use(express.static(path.join(__dirname, "../frontend")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "estoque_db"
});

db.connect(err => {
    if (err) throw err;
    console.log("Banco conectado!");
});

// Proteger rota de produtos
const verificarToken = require("./middleware/auth");

// Listar produtos
app.get("/produtos", verificarToken, (req, res) => {
    db.query("SELECT * FROM produtos", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Adicionar produto
app.post("/produtos", verificarToken, (req, res) => {
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(
        "INSERT INTO produtos (nome, codigo, marca, quantidade, preco_custo, preco_venda) VALUES (?, ?,?, ?, ?, ?)",
        [nome, codigo, marca, quantidade, preco_custo, preco_venda],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto cadastrado!" });
        }
    );
});

// Editar produto
app.put("/produtos/:id", (req, res) => {

    const id = req.params.id;
    const { nome, codigo, marca, quantidade, preco_custo, preco_venda } = req.body;

    db.query(`
        UPDATE produtos
        SET nome=?, codigo=?, marca=?, quantidade=?, preco_custo=?, preco_venda=?
        WHERE id=?
    `,
        [nome, codigo, marca, quantidade, preco_custo, preco_venda, id],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            console.log("Atualizado:", result);

            res.json({ message: "Produto atualizado!" });

        });

});

// Remover produto
app.delete("/produtos/:id", (req, res) => {
    db.query(
        "DELETE FROM produtos WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Produto removido!" });
        }
    );
});

// Rota para login
app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result[0];

        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        const token = jwt.sign(
            { id: usuario.id },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({ token });

    });

});


app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
*/

const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());


const path = require("path");
// SERVER FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

const authRouter = require("./routes/auth"); // caminho para o auth.js
const produtosRouter = require("./routes/produtos");

app.use("/", authRouter); // ou "/auth" se quiser prefixar
app.use("/", produtosRouter);    // /produtos, /produtos/:id etc.

// Todas as rotas de produtos
//app.use("/", produtosRouter);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});