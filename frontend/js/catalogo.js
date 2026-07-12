const isMobile = window.innerWidth <= 768;
const WPP_NUM = "5551986117103";
const LOJA_NOME = "Leal Cosméticos";

// ── TEXTO HERO ──
// O texto dinâmico do hero vem do arquivo externo ../js/script.js.
// Mantemos o bloco vazio aqui para evitar duplicidade de animação.

// ── CURSOR ──
if (!isMobile) {
  const cur = document.getElementById("cursor");
  const ring = document.getElementById("cursor-ring");

  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animCursor() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;

    cur.style.left = mx + "px";
    cur.style.top = my + "px";

    ring.style.left = rx + "px";
    ring.style.top = ry + "px";

    requestAnimationFrame(animCursor);
  })();
}

// ── PARTÍCULAS HERO ──
const hero = document.getElementById("hero");
const particleCount = isMobile ? 4 : 18;

for (let i = 0; i < particleCount; i++) {
  const p = document.createElement("div");
  p.className = "hero-particle";

  const s = 4 + Math.random() * 20;

  p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;animation-duration:${8 + Math.random() * 14}s;animation-delay:${Math.random() * 10}s;opacity:${0.04 + Math.random() * 0.1}`;

  hero.appendChild(p);
}

// ── STRIP ──
const stripWords = [
  "✦ Perfumes",
  "✦ Cremes",
  "✦ Maquiagem",
  "✦ Hidratantes",
  "✦ Cosméticos",
  "✦ Novidades",
  "✦ Promoções",
  "✦ Produtos Premium",
];

const stripEl = document.getElementById("strip");

const stripHTML = stripWords
  .map(
    (w) =>
      `<span class="strip-item">${w}<span class="strip-dot"></span></span>`,
  )
  .join("");

stripEl.innerHTML = stripHTML + stripHTML;

// ── ESTADO ──
let todos = [];
let filtrados = [];
let carrinho = [];
let buscaAtual = "";
let filtroAtual = "todos";
let favoritos = carregarFavoritos();

function garantirCarrinho() {
  if (!Array.isArray(carrinho)) {
    carrinho = [];
  }

  return carrinho;
}

function normalizarNumero(valor) {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  return Number(valor) || 0;
}

function formatarPreco(valor) {
  return normalizarNumero(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularDescontoPercentual(precoNormal, precoPromo) {
  precoNormal = normalizarNumero(precoNormal);
  precoPromo = normalizarNumero(precoPromo);

  if (!precoNormal || !precoPromo || precoPromo >= precoNormal) return 0;

  return Math.round(((precoNormal - precoPromo) / precoNormal) * 100);
}

function formatarEconomia(precoNormal, precoPromo) {
  const economia = normalizarNumero(precoNormal) - normalizarNumero(precoPromo);
  return economia > 0 ? formatarPreco(economia) : "";
}

function temPromocaoProduto(p) {
  const precoNormal = normalizarNumero(p.preco_venda);
  const precoPromo = normalizarNumero(p.preco_promocional);

  const promocaoAtiva =
    p.promocao_ativa === true ||
    p.promocao_ativa === "true" ||
    p.promocao_ativa === 1 ||
    p.promocao_ativa === "1";

  return promocaoAtiva && precoPromo > 0 && precoPromo < precoNormal;
}

function getPrecoFinal(p) {
  return temPromocaoProduto(p)
    ? normalizarNumero(p.preco_promocional)
    : normalizarNumero(p.preco_venda);
}

function carregarFavoritos() {
  try {
    const salvos = JSON.parse(localStorage.getItem("leal_favoritos") || "[]");
    return Array.isArray(salvos) ? salvos.map(String) : [];
  } catch (e) {
    return [];
  }
}

function salvarFavoritos() {
  localStorage.setItem("leal_favoritos", JSON.stringify(favoritos));
}

function getProdutoKey(produtoOuId) {
  if (produtoOuId && typeof produtoOuId === "object") {
    return String(produtoOuId.id);
  }
  return String(produtoOuId);
}

function isFavorito(produtoOuId) {
  return favoritos.includes(getProdutoKey(produtoOuId));
}

function toggleFavorito(id) {
  const key = getProdutoKey(id);
  if (favoritos.includes(key)) {
    favoritos = favoritos.filter((f) => f !== key);
  } else {
    favoritos.push(key);
  }

  salvarFavoritos();
  atualizarFavoritosUI();
  renderGrid();
}

function atualizarFavoritosUI() {
  const totalFav = favoritos.length;
  const navFavText = document.getElementById("navFavoritosText");
  if (navFavText) {
    navFavText.textContent =
      totalFav > 0 ? `Favoritos (${totalFav})` : "Favoritos";
  }

  const filtroFav = document.querySelector('[data-filtro="favoritos"] span');
  if (filtroFav) {
    filtroFav.textContent =
      totalFav > 0 ? `❤️ Favoritos (${totalFav})` : "❤️ Favoritos";
  }
}

function filtrarFavoritosNav(el) {
  filtrarCatalogo(
    "favoritos",
    document.querySelector('[data-filtro="favoritos"]') || el,
  );
  document
    .getElementById("grid")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function voltarInicioCatalogo() {
  filtrarCatalogo("todos", document.querySelector('[data-filtro="todos"]'));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function atualizarNavMobile() {
  document
    .getElementById("navInicio")
    ?.classList.toggle("ativo", filtroAtual !== "favoritos");
  document
    .getElementById("navFavoritos")
    ?.classList.toggle("ativo", filtroAtual === "favoritos");
}

async function carregar() {
  try {
    const r = await fetch("/catalogo/produtos");

    if (!r.ok) {
      throw new Error("Erro ao carregar produtos do catálogo");
    }

    todos = await r.json();
    console.log(todos);
    preencherFiltros();
    atualizarFavoritosUI();
    aplicarFiltros();
  } catch (e) {
    console.error("Erro ao carregar catálogo:", e);

    document.getElementById("grid").innerHTML =
      `<div class="empty"><div class="empty-icon">😕</div><p>Não foi possível carregar os produtos.</p></div>`;
  }
}

function preencherFiltros() {
  const marcas = [...new Set(todos.map((p) => p.marca).filter(Boolean))].sort();

  const container = document.getElementById("filtros");

  container.innerHTML = `
          <button class="chip chip-filtro ativo" data-filtro="todos" onclick="filtrarCatalogo('todos', this)">
            <span>Todos</span>
          </button>

          <button class="chip chip-filtro" data-filtro="promocoes" onclick="filtrarCatalogo('promocoes', this)">
            <span>🔥 Promoções</span>
          </button>

          <button class="chip chip-filtro" data-filtro="favoritos" onclick="filtrarCatalogo('favoritos', this)">
            <span>❤️ Favoritos</span>
          </button>

          <button class="chip chip-filtro" data-filtro="pronta" onclick="filtrarCatalogo('pronta', this)">
            <span>✅ Pronta entrega</span>
          </button>

          <button class="chip chip-filtro" data-filtro="encomenda" onclick="filtrarCatalogo('encomenda', this)">
            <span>📦 Encomenda</span>
          </button>
        `;

  marcas.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "chip chip-filtro";
    btn.dataset.filtro = "marca:" + m;
    btn.innerHTML = `<span>${m}</span>`;
    btn.onclick = () => filtrarCatalogo("marca:" + m, btn);
    container.appendChild(btn);
  });
}

function filtrarCatalogo(filtro, el) {
  filtroAtual = filtro;

  document
    .querySelectorAll(".chip-filtro")
    .forEach((c) => c.classList.remove("ativo"));

  if (el) {
    el.classList.add("ativo");
  }

  atualizarNavMobile();
  aplicarFiltros();
}

function buscar(q) {
  buscaAtual = (q || "").toLowerCase().trim();
  aplicarFiltros();
}

function aplicarFiltros() {
  filtrados = todos.filter((p) => {
    const nome = (p.nome || "").toLowerCase();
    const marca = (p.marca || "").toLowerCase();
    const descricao = (p.descricao || "").toLowerCase();
    const statusBusca = (p.status_entrega || "").toLowerCase();

    const okBusca =
      !buscaAtual ||
      nome.includes(buscaAtual) ||
      marca.includes(buscaAtual) ||
      descricao.includes(buscaAtual) ||
      statusBusca.includes(buscaAtual);

    let okFiltro = true;

    if (filtroAtual === "promocoes") {
      okFiltro = temPromocaoProduto(p);
    }

    if (filtroAtual === "favoritos") {
      okFiltro = isFavorito(p.id);
    }

    if (filtroAtual === "pronta") {
      okFiltro = (p.status_entrega || "").toUpperCase().includes("PRONTA");
    }

    if (filtroAtual === "encomenda") {
      okFiltro = (p.status_entrega || "").toUpperCase().includes("ENCOMENDA");
    }

    if (filtroAtual.startsWith("marca:")) {
      const marcaSelecionada = filtroAtual.replace("marca:", "");
      okFiltro = p.marca === marcaSelecionada;
    }

    return okBusca && okFiltro;
  });

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("grid");

  if (!filtrados.length) {
    const msg =
      filtroAtual === "favoritos"
        ? "Você ainda não favoritou nenhum produto. Toque no coração dos produtos para salvar aqui."
        : "Nenhum produto encontrado.";
    grid.innerHTML = `<div class="empty"><div class="empty-icon">${filtroAtual === "favoritos" ? "❤️" : "🔍"}</div><p>${msg}</p></div>`;
    return;
  }

  garantirCarrinho();

  grid.innerHTML = filtrados
    .map((p, i) => {
      const precoNormal = normalizarNumero(p.preco_venda);
      const precoPromo = normalizarNumero(p.preco_promocional);
      const temPromo = temPromocaoProduto(p);
      const descontoPercentual = calcularDescontoPercentual(
        precoNormal,
        precoPromo,
      );
      const economiaPromo = formatarEconomia(precoNormal, precoPromo);

      const esgot = normalizarNumero(p.quantidade) <= 0;
      const favorito = isFavorito(p.id);

      const status = (p.status_entrega || "").toUpperCase();

      let statusEntrega = "";

      const noCart = carrinho.some(
        (c) => Number(c.produto.id) === Number(p.id),
      );

      const img = p.imagemproduto
        ? `<img class="card-img" src="${p.imagemproduto}" alt="${p.nome || ""}" loading="lazy" decoding="async"/>`
        : `<div class="card-placeholder">💄</div>`;

      const isNovo = i < 2;

      const precoHtml = temPromo
        ? `
                <div class="card-preco-wrap">
                  <span class="card-preco-antigo">De ${formatarPreco(precoNormal)}</span>
                  <span class="card-preco-promo">Por ${formatarPreco(precoPromo)}</span>
                  ${descontoPercentual ? `<span class="badge-desconto">🔥 ${descontoPercentual}% OFF</span>` : ""}
                </div>
              `
        : `
                <div class="card-preco-wrap">
                  <span class="card-preco-normal">${formatarPreco(precoNormal)}</span>
                </div>
              `;

      let badgeEntrega = "";

      const statusBadge = (p.status_entrega || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[\s-]+/g, "_");

      if (statusBadge.includes("PRONTA")) {
        badgeEntrega = `
      <span class="badge-entrega pronta">
        ✅ Pronta entrega
      </span>`;
      } else if (statusBadge.includes("ENCOMENDA")) {
        badgeEntrega = `
      <span class="badge-entrega encomenda">
        📦 Encomenda
      </span>`;
      } else if (statusBadge.includes("INDISPON")) {
        badgeEntrega = `
      <span class="badge-entrega indisponivel">
        ❌ Indisponível
      </span>`;
      }
      return `
              <div class="card" style="animation-delay:${i * 0.06}s" onclick="abrirModalProdutoCatalogo(${p.id})">
                <div class="card-img-wrap">
                  ${img}

                  <button class="favorite-btn ${favorito ? "ativo" : ""}" onclick="event.stopPropagation(); toggleFavorito(${p.id})" aria-label="${favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}" type="button">
                    ${favorito ? "❤️" : "🤍"}
                  </button>

                  <div class="card-overlay">
                    <span class="card-overlay-text">Ver produto</span>
                  </div>

                 ${esgot ? '<span class="badge-esgotado">Esgotado</span>' : ""}
                  <div class="card-badges">
                  ${temPromo && !esgot ? '<span class="badge-promo">🔥 Promoção</span>' : ""}
                  ${!esgot ? badgeEntrega : ""}
                  </div>
                  ${isNovo && !esgot && !temPromo ? '<span class="badge-novo">Novo</span>' : ""}
                </div>

               <div class="card-body">
                  <div class="card-marca">${p.marca || ""}</div>
                  <div class="card-nome">${p.nome || ""}</div>

                  ${precoHtml}

                  ${statusEntrega}
                </div>

                <div class="card-footer">
                  <button
                    class="btn-add ${noCart ? "adicionado" : ""}"
                    onclick="event.stopPropagation(); toggleCarrinho(${p.id})"
                    ${esgot ? "disabled" : ""}
                  >
                    <span>
                      ${esgot ? "😕 Esgotado" : noCart ? "✓ Adicionado" : "+ Adicionar ao pedido"}
                    </span>
                  </button>
                </div>
              </div>`;
    })
    .join("");
}

function abrirModalProdutoCatalogo(id) {
  const produto = todos.find((p) => Number(p.id) === Number(id));
  if (!produto) return;

  garantirCarrinho();

  const overlay = document.getElementById("produtoModalOverlay");
  const imgBox = document.getElementById("produtoModalImg");
  const badges = document.getElementById("produtoModalBadges");
  const marca = document.getElementById("produtoModalMarca");
  const nome = document.getElementById("produtoModalNome");
  const preco = document.getElementById("produtoModalPreco");
  const btnFavorito = document.getElementById("produtoModalFavorito");
  const resumo = document.getElementById("produtoModalResumo");
  const desc = document.getElementById("produtoModalDesc");
  const estoque = document.getElementById("produtoModalEstoque");
  const btnAdd = document.getElementById("produtoModalBtnAdd");

  if (
    !overlay ||
    !imgBox ||
    !badges ||
    !marca ||
    !nome ||
    !preco ||
    !btnFavorito ||
    !resumo ||
    !desc ||
    !estoque ||
    !btnAdd
  ) {
    return;
  }

  const precoNormal = normalizarNumero(produto.preco_venda);
  const precoPromo = normalizarNumero(produto.preco_promocional);
  const temPromo = temPromocaoProduto(produto);
  const descontoPercentual = calcularDescontoPercentual(
    precoNormal,
    precoPromo,
  );
  const economiaPromo = formatarEconomia(precoNormal, precoPromo);
  const qtd = normalizarNumero(produto.quantidade);
  const esgotado = qtd <= 0;

  const estaNoCarrinho = carrinho.some(
    (c) => Number(c.produto.id) === Number(produto.id),
  );

  btnAdd.classList.toggle("adicionado", estaNoCarrinho);

  btnAdd.textContent = estaNoCarrinho
    ? "✓ Produto adicionado"
    : "+ Adicionar ao pedido";

  imgBox.innerHTML = produto.imagemproduto
    ? `<img src="${produto.imagemproduto}" alt="${produto.nome || ""}" />`
    : `<div class="produto-modal-placeholder">💄</div>`;

  const statusModal = (produto.status_entrega || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  let badgeEntregaModal = "";
  let statusEntrega = "";

  if (statusModal.includes("PRONTA")) {
    badgeEntregaModal =
      '<span class="produto-modal-badge pronta">✅ Pronta entrega</span>';
    statusEntrega = "✅ Pronta entrega";
  } else if (statusModal.includes("ENCOMENDA")) {
    badgeEntregaModal =
      '<span class="produto-modal-badge encomenda">📦 Encomenda</span>';
    statusEntrega = "📦 Encomenda";
  } else if (statusModal.includes("INDISPON")) {
    badgeEntregaModal =
      '<span class="produto-modal-badge indisponivel">❌ Indisponível</span>';
    statusEntrega = "❌ Indisponível";
  }

  badges.innerHTML = `
          ${temPromo && !esgotado ? '<span class="produto-modal-badge promo">Promoção</span>' : ""}
          ${!esgotado ? badgeEntregaModal : ""}
          ${esgotado ? '<span class="produto-modal-badge esgotado">Esgotado</span>' : ""}
        `;

  marca.textContent = produto.marca || "";
  nome.textContent = produto.nome || "";

  const favoritoModal = isFavorito(produto.id);
  btnFavorito.classList.toggle("ativo", favoritoModal);
  btnFavorito.innerHTML = favoritoModal
    ? "❤️ Remover dos favoritos"
    : "🤍 Adicionar aos favoritos";
  btnFavorito.onclick = function (event) {
    event.stopPropagation();
    toggleFavorito(produto.id);
    const atualizado = isFavorito(produto.id);
    btnFavorito.classList.toggle("ativo", atualizado);
    btnFavorito.innerHTML = atualizado
      ? "❤️ Remover dos favoritos"
      : "🤍 Adicionar aos favoritos";
  };

  preco.innerHTML = temPromo
    ? `
            <span class="preco-antigo">De ${formatarPreco(precoNormal)}</span>
            <span class="preco-promo">Por ${formatarPreco(precoPromo)}</span>
            ${descontoPercentual ? `<span class="preco-desconto">🔥 ${descontoPercentual}% OFF · Economize ${economiaPromo}</span>` : ""}
          `
    : `
            <span class="preco-normal">${formatarPreco(precoNormal)}</span>
          `;

  resumo.innerHTML = `
          <div class="produto-modal-resumo-card">
            <span class="produto-modal-resumo-label">Estoque</span>
            <span class="produto-modal-resumo-value">${qtd > 0 ? `${qtd} unidade(s)` : "Esgotado"}</span>
          </div>
          <div class="produto-modal-resumo-card">
            <span class="produto-modal-resumo-label">Entrega</span>
            <span class="produto-modal-resumo-value">${statusEntrega || "Consultar"}</span>
          </div>
          <div class="produto-modal-resumo-card">
            <span class="produto-modal-resumo-label">Promoção</span>
            <span class="produto-modal-resumo-value">${temPromo ? `${descontoPercentual}% OFF` : "Preço normal"}</span>
          </div>
        `;

  desc.textContent =
    produto.descricao?.trim() || "Produto sem descrição cadastrada.";

  let descricao = produto.descricao || "";

  descricao = descricao

    .replace(/Resumo do cheiro:/gi, "<strong>🌸 Resumo do cheiro</strong>")
    .replace(
      /Principais notas\/especiarias:/gi,
      "<strong>✨ Principais notas</strong>",
    )
    .replace(/Contém:/gi, "<strong>📦 Contém</strong>")
    .replace(/Modo de uso:/gi, "<strong>💆 Modo de uso</strong>")
    .replace(/Indicação:/gi, "<strong>💜 Indicação</strong>")
    .replace(/Benefícios:/gi, "<strong>⭐ Benefícios</strong>");

  desc.innerHTML = descricao;

  estoque.innerHTML = `
  <strong>Entrega:</strong> ${statusEntrega}
`;
  btnAdd.disabled = esgotado;
  btnAdd.classList.toggle("adicionado", estaNoCarrinho);
  btnAdd.textContent = esgotado
    ? "Produto esgotado"
    : estaNoCarrinho
      ? "✓ Remover do pedido"
      : "+ Adicionar ao pedido";

  btnAdd.onclick = function () {
    fecharModalProdutoCatalogo();
    toggleCarrinho(produto.id);
  };

  overlay.classList.add("aberto");
  document.body.style.overflow = "hidden";
}

function fecharModalProdutoCatalogo() {
  const overlay = document.getElementById("produtoModalOverlay");
  if (overlay) overlay.classList.remove("aberto");

  const drawer = document.getElementById("drawer");
  const drawerAberto = drawer && drawer.classList.contains("aberto");

  document.body.style.overflow = drawerAberto ? "hidden" : "";
}

function toggleCarrinho(id) {
  garantirCarrinho();

  const produto = todos.find((p) => Number(p.id) === Number(id));
  if (!produto) return;

  const idx = carrinho.findIndex((c) => Number(c.produto.id) === Number(id));

  const isNew = idx < 0;

  if (isNew) {
    carrinho.push({ produto, qtd: 1 });
  } else {
    carrinho.splice(idx, 1);
  }

  atualizarFAB();
  renderGrid();
  renderDrawer();

  if (isNew && carrinho.length === 1) {
    abrirDrawer();
  }
}

function alterarQtd(id, d) {
  garantirCarrinho();

  const idx = carrinho.findIndex((c) => Number(c.produto.id) === Number(id));

  if (idx < 0) return;

  carrinho[idx].qtd = normalizarNumero(carrinho[idx].qtd) + d;

  if (carrinho[idx].qtd <= 0) {
    carrinho.splice(idx, 1);
  }

  atualizarFAB();
  renderDrawer();
  renderGrid();
}

function atualizarFAB() {
  garantirCarrinho();

  const b = document.getElementById("fabBadge");
  const bar = document.getElementById("cartSummaryBar");
  const title = document.getElementById("cartSummaryTitle");
  const totalEl = document.getElementById("cartSummaryTotal");
  const navPedidoText = document.getElementById("navPedidoText");

  const totalItens = carrinho.reduce((s, c) => s + normalizarNumero(c.qtd), 0);

  const totalPedido = carrinho.reduce(
    (s, c) => s + getPrecoFinal(c.produto) * (normalizarNumero(c.qtd) || 1),
    0,
  );

  if (b) {
    b.textContent = totalItens;
    b.style.display = totalItens > 0 ? "flex" : "none";
  }

  if (navPedidoText) {
    navPedidoText.textContent =
      totalItens > 0 ? `Pedido (${totalItens})` : "Pedido";
  }

  if (bar && title && totalEl) {
    if (totalItens > 0) {
      bar.classList.add("visivel");
      title.textContent = `${totalItens} ${totalItens === 1 ? "item" : "itens"} no pedido`;
      totalEl.textContent = formatarPreco(totalPedido);
    } else {
      bar.classList.remove("visivel");
      title.textContent = "Meu pedido";
      totalEl.textContent = "R$ 0,00";
    }
  }
}

function renderDrawer() {
  garantirCarrinho();

  const cont = document.getElementById("drawerItems");
  const tv = document.getElementById("drawerTotal");
  const btn = document.getElementById("btnWpp");

  if (!cont || !tv || !btn) return;

  if (!carrinho.length) {
    cont.innerHTML =
      '<div class="drawer-empty">Nenhum item ainda.<br>Adicione produtos ao lado! 💜</div>';

    tv.textContent = "R$ 0,00";
    btn.disabled = true;
    return;
  }

  let total = 0;

  cont.innerHTML = carrinho
    .map((item) => {
      const produto = item.produto;
      const qtd = normalizarNumero(item.qtd) || 1;

      const precoFinal = getPrecoFinal(produto);
      const sub = precoFinal * qtd;

      total += sub;

      const img = produto.imagemproduto
        ? `<img class="ditem-img" src="${produto.imagemproduto}" alt="${produto.nome || ""}"/>`
        : `<div class="ditem-ph">💄</div>`;

      return `
              <div class="ditem">
                ${img}

                <div class="ditem-info">
                  <div class="ditem-nome">${produto.nome || ""}</div>
                  <div class="ditem-preco">${formatarPreco(sub)}</div>
                </div>

                <div class="ditem-qtd">
                  <button onclick="alterarQtd(${produto.id}, -1)">−</button>
                  <span>${qtd}</span>
                  <button onclick="alterarQtd(${produto.id}, 1)">+</button>
                </div>
              </div>`;
    })
    .join("");

  tv.textContent = formatarPreco(total);
  btn.disabled = false;
}

function abrirDrawer() {
  garantirCarrinho();

  renderDrawer();

  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");

  if (drawer) drawer.classList.add("aberto");
  if (overlay) overlay.classList.add("aberto");

  document.body.style.overflow = "hidden";
}

function fecharDrawer() {
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("overlay");

  if (drawer) drawer.classList.remove("aberto");
  if (overlay) overlay.classList.remove("aberto");

  document.body.style.overflow = "";
}

function enviarWpp() {
  garantirCarrinho();

  if (!carrinho.length) return;

  const obs = document.getElementById("obs").value.trim();

  const total = carrinho.reduce(
    (s, c) => s + getPrecoFinal(c.produto) * (normalizarNumero(c.qtd) || 1),
    0,
  );

  let msg = `Olá! Gostaria de fazer um pedido no *${LOJA_NOME}* 💜\n\n*Itens do pedido:*\n`;

  carrinho.forEach((item) => {
    const qtd = normalizarNumero(item.qtd) || 1;
    const sub = getPrecoFinal(item.produto) * qtd;
    const temPromo = temPromocaoProduto(item.produto);

    msg += `• ${item.produto.nome} x${qtd} — ${formatarPreco(sub)}${temPromo ? " 🔥 promo" : ""}\n`;
  });

  msg += `\n*Total: ${formatarPreco(total)}*`;

  if (obs) {
    msg += `\n\n*Observações:* ${obs}`;
  }

  window.open(
    `https://wa.me/${WPP_NUM}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharModalProdutoCatalogo();
  }
});

atualizarFavoritosUI();
atualizarFAB();
carregar();
