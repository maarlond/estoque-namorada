//const API_URL = window.location.origin;

function validarCampos() {
  let valido = true;

  const email = document.getElementById("email");
  //const codigo = document.getElementById("codigo");
  const senha = document.getElementById("senha");

  const campos = [email, senha];

  // remove erro antigo
  /*campos.forEach((c) => c.classList.remove("campo-erro"));

  if (!email.value.trim()) {
    email.classList.add("campo-erro");
    valido = false;
  }

  if (!senha.value.trim()) {
    senha.classList.add("campo-erro");
    valido = false;
  }
*/

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

async function login() {
  console.log("aaaaaaaaaa");
  if (!validarCampos()) return;

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (!email || !senha) {
    Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha todos os campos antes de continuar.",
    });
    return;
  }
  console.log("email" + email);
  console.log("senha" + senha);

  const resposta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  console.log("resposta: " + resposta);
  const data = await resposta.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("logado", "true");
    localStorage.setItem("emailUsuario", email);

    window.location.href = "../index.html";
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "E-mail ou senha inválidos",
    });
  }
}
