const bcrypt = require("bcryptjs");

const senha = "123456";

bcrypt.hash(senha, 10).then(hash => {
    console.log(hash);
});