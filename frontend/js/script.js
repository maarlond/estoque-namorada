// ------------------------------
// PRODUTOS
// ------------------------------
const API_URL = window.location.origin;
//let produtoEditando = null;

// ------------------------------
// TOKEN PARA REQUISIÇÕES
// ------------------------------
const token = localStorage.getItem("token");
const pathAtual = window.location.pathname;
const btnLogout = document.getElementById("btnLogout");

/*if (!token && pathAtual !== "../pages/login.html" && pathAtual !== "/cadastro.html") {
    window.location.href = "../pages/login.html";
}*/

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("toggleSidebar");
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("colapsada");

    if (sidebar.classList.contains("colapsada")) {
      toggleBtn.innerHTML = "»";
    } else {
      toggleBtn.innerHTML = "«";
    }
  });
});
function validarCampos() {
  let valido = true;

  const nome = document.getElementById("nome");
  const codigo = document.getElementById("codigo");
  const quantidade = document.getElementById("quantidade");
  const custo = document.getElementById("preco_custo");
  const venda = document.getElementById("preco_venda");

  const campos = [nome, codigo, quantidade, custo, venda];

  // remove erro antigo
  /*campos.forEach((c) => c.classList.remove("campo-erro"));

  if (!nome.value.trim()) {
    nome.classList.add("campo-erro");
    valido = false;
  }

  if (!codigo.value.trim()) {
    codigo.classList.add("campo-erro");
    valido = false;
  }

  if (!quantidade.value || quantidade.value <= 0) {
    quantidade.classList.add("campo-erro");
    valido = false;
  }

  if (!custo.value || custo.value <= 0) {
    custo.classList.add("campo-erro");
    valido = false;
  }

  if (!venda.value || venda.value <= 0) {
    venda.classList.add("campo-erro");
    valido = false;
  }*/

  if (!valido) {
    Swal.fire({
      icon: "warning",
      title: "Preencha os campos obrigatórios",
      text: "Os campos em vermelho precisam ser corrigidos.",
    });

    return false;
  }

  return true;
}

function toggleSenha() {
  const input = document.getElementById("senha");
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}

// ------------------------------
// LOGIN / LOGOUT
// ------------------------------
if (btnLogout) {
  btnLogout.addEventListener("click", logout);
}

async function logout() {
  const resultado = await Swal.fire({
    title: "Tem certeza?",
    text: "Deseja sair do sistema?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, sair",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (resultado.isConfirmed) {
    localStorage.removeItem("logado");
    localStorage.removeItem("emailUsuario");
    localStorage.removeItem("token");
    window.location.href = "../pages/login.html";
  }
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

// --- TEXTO EXEMPLO DINÂMICO ---

document.addEventListener("DOMContentLoaded", () => {
  const div = document.getElementById("textoExemplo");

  if (!div) return;

  const frases = [
    "🌸 Desperte sua essência — o perfume certo transforma qualquer momento.",
    "✨ Perfume é mais que aroma, é identidade.",
    "💄 Cada fragrância conta uma história — qual será a sua?",
  ];

  let fraseIndex = 0;

  function digitar(frase, callback) {
    let i = 0;
    div.innerHTML = "";

    function passo() {
      if (i < frase.length) {
        div.innerHTML += frase[i] === "\n" ? "<br>" : frase[i];
        i++;
        setTimeout(passo, 50);
      } else {
        setTimeout(callback, 1500);
      }
    }

    passo();
  }

  function proximaFrase() {
    digitar(frases[fraseIndex], () => {
      fraseIndex = (fraseIndex + 1) % frases.length;
      proximaFrase();
    });
  }
  proximaFrase();
});
