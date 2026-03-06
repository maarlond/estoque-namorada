const jwt = require("jsonwebtoken");

const SECRET = "segredo_super";

function verificarToken(req, res, next) {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(403).json({ erro: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, decoded) => {

        if (err) {
            return res.status(401).json({ erro: "Token inválido" });
        }

        req.usuarioId = decoded.id;

        next();
    });

}

module.exports = verificarToken;