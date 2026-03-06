// Pega os elementos do formulário
//const btnCadastrar = document.getElementById("btnCadastrar");

// ===============================
// Funções de validação
// ===============================

// Valida email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Valida senha (mínimo 6 caracteres, pelo menos uma letra e um número)
function validarSenha(senha) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(senha);
}

async function cadastrarUsuario() {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    // Validar confirmação de senha
    const confirmaSenha = document.getElementById("confirmaSenha").value;

    // Validação simples
    if (!nome || !email || !senha) {
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos antes de continuar."
        });
        return;
    }

    // Validação do e-mail
    if (!validarEmail(email)) {
        Swal.fire({
            icon: "error",
            title: "Email inválido",
            text: "Digite um email válido."
        });
        return;
    }

    // Validação da senha
    if (!validarSenha(senha)) {
        Swal.fire({
            icon: "error",
            title: "Senha inválida",
            text: "A senha deve ter pelo menos 6 caracteres, incluindo letras e números."
        });
        return;
    }

    if (senha !== confirmaSenha) {
        Swal.fire({
            icon: "error",
            title: "Senhas não conferem",
            text: "Digite a mesma senha nos dois campos."
        });
        return;
    }

    // Mostrar loading
    Swal.fire({
        title: "Cadastrando...",
        text: "Aguarde um momento",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const resposta = await fetch("http://localhost:3000/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            Swal.fire({
                icon: "error",
                title: "Erro",
                text: resultado.mensagem || "Não foi possível cadastrar."
            });
            return;
        }

        Swal.fire({
            icon: "success",
            title: "Cadastro realizado!",
            text: "Você já pode fazer login agora.",
            confirmButtonText: "Ir para login"
        }).then(() => {
            window.location.href = "login.html";
        });

    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Não foi possível conectar ao servidor."
        });
    }
}