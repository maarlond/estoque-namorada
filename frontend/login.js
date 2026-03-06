async function login() {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        //alert("Preencha todos os campos!");
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos antes de continuar."
        });
        return;
    }

    const resposta = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
    });

    const data = await resposta.json();

    if (data.token) {
        localStorage.setItem("token", data.token);

        window.location.href = "index.html";

    } else {

        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Email ou senha inválidos"
        });
        //alert("Login inválido");

    }

}