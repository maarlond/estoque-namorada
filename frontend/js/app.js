function carregarPagina(pagina, elemento) {

    const conteudo = document.getElementById("conteudoPrincipal");

    // anima saída
    conteudo.classList.add("fade-out");

    setTimeout(() => {

        $("#conteudoPrincipal").load(pagina, function () {

            // remover active de todos
            document.querySelectorAll(".menu-item").forEach(link => {
                link.classList.remove("active");
            });

            // adicionar active
            if (elemento) {
                elemento.classList.add("active");
            }

            // salvar última página
            localStorage.setItem("paginaAtual", pagina);

            // ------------------------
            // COLAPSAR SIDEBAR
            // ------------------------
            /*
            if (pagina !== "pages/index.html") {
                document.querySelector(".sidebar").classList.add("colapsada");
            } else {
                document.querySelector(".sidebar").classList.remove("colapsada");
            }*/

            // ------------------------
            // INICIAR SCRIPTS DAS PÁGINAS
            // ------------------------

            if (pagina.includes("produtos")) {
                if (typeof iniciarTabelaProdutos === "function") {
                    iniciarTabelaProdutos();
                }
            }

            if (pagina.includes("dashboard")) {
                if (typeof iniciarDashboard === "function") {
                    iniciarDashboard();
                }
            }

            // ------------------------
            // ANIMAÇÃO DE ENTRADA
            // ------------------------

            conteudo.classList.remove("fade-out");
            conteudo.classList.add("fade-in");

            setTimeout(() => {
                conteudo.classList.remove("fade-in");
            }, 250);

        });

    }, 200);

}

/*$("#conteudoPrincipal").load(pagina, function () {

  if (pagina.includes("produtos")) {

    document.querySelector(".sidebar").classList.add("colapsada");

    setTimeout(() => {
      if (typeof iniciarTabelaProdutos === "function") {
    iniciarTabelaProdutos();
      }
    }, 100);

  } else {

    document.querySelector(".sidebar").classList.remove("colapsada");

  }

});*/

document.addEventListener("DOMContentLoaded", function () {

    const menuDashboard = document.querySelector('[data-pagina="pages/dashboard.html"]');

    if (menuDashboard) {
        carregarPagina("pages/dashboard.html", menuDashboard);
    } else {
        carregarPagina("pages/dashboard.html");
    }

});

document.addEventListener("DOMContentLoaded", function () {

    let paginaSalva = localStorage.getItem("paginaAtual");

    if (!paginaSalva) {
        paginaSalva = "pages/dashboard.html";
    }

    const menu = document.querySelector(`[data-pagina="${paginaSalva}"]`);

    carregarPagina(paginaSalva, menu);

});