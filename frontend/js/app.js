function carregarPagina(pagina, elemento) {
  const conteudo = document.getElementById("conteudoPrincipal");

  conteudo.classList.add("fade-out");

  setTimeout(() => {
    $("#conteudoPrincipal").load(pagina, function () {
      // remove active de todos
      document.querySelectorAll(".menu-item").forEach((link) => {
        link.classList.remove("active");
      });

      if (elemento) {
        elemento.classList.add("active");
      }

      localStorage.setItem("paginaAtual", pagina);

      // INICIAR SCRIPTS DAS PÁGINAS
      if (pagina.includes("produtos")) {
        if (typeof iniciarTabelaProdutos === "function") {
          //iniciarTabelaProdutos();
          initProdutos();
        }
      }

      if (pagina.includes("dashboard")) {
        if (typeof iniciarDashboard === "function") {
          iniciarDashboard();
        }
      }

      // ← NOVO: inicializa a tela de vendas
      if (pagina.includes("vendas")) {
        if (typeof iniciarVendas === "function") {
          iniciarVendas();
        }
      }

      conteudo.classList.remove("fade-out");
      conteudo.classList.add("fade-in");
      setTimeout(() => conteudo.classList.remove("fade-in"), 250);
    });
  }, 200);
}

// ← apenas UM DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  let paginaSalva =
    localStorage.getItem("paginaAtual") || "pages/dashboard.html";
  const menu = document.querySelector(`[data-pagina="${paginaSalva}"]`);
  carregarPagina(paginaSalva, menu);
});
