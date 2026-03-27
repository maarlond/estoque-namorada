// ── ESTADO ──────────────────────────────────────────────
let todosProdutos = [];
let carrinho = [];

// ── FUNÇÃO PRINCIPAL (chamada pelo app.js) ───────────────
function iniciarVendas() {
  if (!document.getElementById("gridProdutos")) return;

  todosProdutos = [];
  carrinho = [];
  renderCarrinho();

  const inputBusca = document.getElementById("inputBusca");
  if (inputBusca) {
    inputBusca.addEventListener("input", function () {
      const q = this.value.toLowerCase().trim();
      renderProdutos(
        q
          ? todosProdutos.filter((p) => p.nome.toLowerCase().includes(q))
          : todosProdutos,
      );
    });
  }

  carregarProdutosVenda();
}

// ── CARREGAR PRODUTOS ────────────────────────────────────
async function carregarProdutosVenda() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/produtos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    todosProdutos = await res.json();
    renderProdutos(todosProdutos);
  } catch (err) {
    console.error(err);
    const grid = document.getElementById("gridProdutos");
    if (grid)
      grid.innerHTML = `<div class="empty-state"><p>Não foi possível carregar os produtos.</p></div>`;
  }
}

// ── RENDER GRID ──────────────────────────────────────────
function renderProdutos(lista) {
  const grid = document.getElementById("gridProdutos");
  if (!grid) return;

  if (!lista.length) {
    grid.innerHTML = `<div class="empty-state"><p>Nenhum produto encontrado</p></div>`;
    return;
  }

  grid.innerHTML = lista
    .map((p) => {
      const semEstoque = (p.quantidade ?? 0) <= 0;
      const estoque = p.quantidade ?? 0;
      const baixo = estoque > 0 && estoque <= 5;
      const preco = parseFloat(p.preco_venda ?? 0);

      const imgHtml = p.imagemProduto
        ? `<img class="produto-img" src="${p.imagemProduto}" alt="${p.nome}" onerror="this.outerHTML='<div class=produto-img-placeholder>💄</div>'" />`
        : `<div class="produto-img-placeholder">💄</div>`;

      return `
      <div class="produto-card${semEstoque ? " sem-estoque" : ""}"
           onclick="${semEstoque ? "" : `adicionarAoCarrinho(${p.id})`}"
           title="${semEstoque ? "Sem estoque" : "Clique para adicionar"}">
        ${imgHtml}
        <div class="produto-info">
          <div class="produto-nome">${p.nome}</div>
          <div class="produto-preco">R$ ${preco.toFixed(2).replace(".", ",")}</div>
          <div class="produto-estoque ${baixo ? "badge-estoque-baixo" : ""}">
            ${semEstoque ? "⚠️ Sem estoque" : `${estoque} em estoque`}
          </div>
        </div>
      </div>`;
    })
    .join("");
}

// ── CARRINHO ─────────────────────────────────────────────
function adicionarAoCarrinho(id) {
  const produto = todosProdutos.find((p) => p.id === id);
  if (!produto) return;
  const estoqueDisp = produto.quantidade ?? 0;
  const item = carrinho.find((c) => c.produto.id === id);

  if (item) {
    if (item.qtd >= estoqueDisp) {
      Swal.fire({
        icon: "warning",
        title: "Estoque insuficiente",
        text: `Máximo: ${estoqueDisp}`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    item.qtd++;
  } else {
    carrinho.push({ produto, qtd: 1 });
  }
  renderCarrinho();
}

function alterarQtd(id, delta) {
  const idx = carrinho.findIndex((c) => c.produto.id === id);
  if (idx < 0) return;
  const estoqueDisp = carrinho[idx].produto.quantidade ?? 0;
  carrinho[idx].qtd += delta;
  if (carrinho[idx].qtd <= 0) {
    carrinho.splice(idx, 1);
  } else if (carrinho[idx].qtd > estoqueDisp) {
    carrinho[idx].qtd = estoqueDisp;
    Swal.fire({
      icon: "warning",
      title: "Estoque insuficiente",
      text: `Máximo: ${estoqueDisp}`,
      timer: 2000,
      showConfirmButton: false,
    });
  }
  renderCarrinho();
}

function removerItem(id) {
  carrinho = carrinho.filter((c) => c.produto.id !== id);
  renderCarrinho();
}

function renderCarrinho() {
  const container = document.getElementById("carrinhoItems");
  if (!container) return;

  if (!carrinho.length) {
    container.innerHTML =
      '<div class="carrinho-vazio">Clique em um produto para adicionar</div>';
    const tv = document.getElementById("totalValor");
    if (tv) tv.textContent = "R$ 0,00";
    return;
  }

  let total = 0;
  const html = carrinho
    .map((item) => {
      const preco = parseFloat(item.produto.preco_venda ?? 0);
      const subtotal = preco * item.qtd;
      total += subtotal;
      return `
      <div class="carrinho-item">
        <span class="ci-nome">${item.produto.nome}</span>
        <div class="ci-qtd">
          <button onclick="alterarQtd(${item.produto.id}, -1)">−</button>
          <span>${item.qtd}</span>
          <button onclick="alterarQtd(${item.produto.id}, 1)">+</button>
        </div>
        <span class="ci-preco">R$ ${subtotal.toFixed(2).replace(".", ",")}</span>
        <button class="ci-remove" onclick="removerItem(${item.produto.id})" title="Remover">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>`;
    })
    .join("");

  container.innerHTML = `<div class="carrinho-items">${html}</div>`;
  const tv = document.getElementById("totalValor");
  if (tv) tv.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
}

// ── FINALIZAR VENDA ──────────────────────────────────────
async function finalizarVenda() {
  if (!carrinho.length) {
    Swal.fire({
      icon: "warning",
      title: "Carrinho vazio",
      text: "Adicione pelo menos um produto.",
    });
    return;
  }
  const forma = document.getElementById("formaPagamento").value;
  if (!forma) {
    Swal.fire({
      icon: "warning",
      title: "Forma de pagamento",
      text: "Selecione a forma de pagamento.",
    });
    return;
  }

  const total = carrinho.reduce(
    (s, i) => s + parseFloat(i.produto.preco_venda ?? 0) * i.qtd,
    0,
  );

  // Adicionando a data da venda
  const inputData = document.getElementById("dataVenda").value; // ex: "2026-03-27T13:43"

  // Convertendo para um objeto Date real para manipular
  // Exemplo: formatando para o padrão brasileiro (DD/MM/YYYY HH:mm)
  const dataFormatada = inputData
    ? inputData + " 00:00:00"
    : new Date().toISOString().slice(0, 19).replace("T", " ");

  console.log("dataFormatada", dataFormatada);
  const payload = {
    forma_pagamento: forma,
    cliente: document.getElementById("nomeCliente").value.trim() || null,
    observacao: document.getElementById("observacao").value.trim() || null,
    total,
    data_venda: dataFormatada,
    itens: carrinho.map((i) => ({
      produto_id: i.produto.id,
      quantidade: i.qtd,
      preco_unitario: parseFloat(i.produto.preco_venda ?? 0),
    })),
  };

  const btn = document.getElementById("btnFinalizar");
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Finalizando...`;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/vendas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    console.log("resres", res);
    console.log("🚀 URL:", `${API_URL}/vendas/`);
    console.log("🚀 Payload:", JSON.stringify(payload));
    if (!res.ok) throw new Error("Erro ao registrar venda");

    await Swal.fire({
      icon: "success",
      title: "Venda finalizada!",
      text: `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
      confirmButtonColor: "#8b5cf6",
    });

    carrinho = [];
    document.getElementById("formaPagamento").value = "";
    document.getElementById("nomeCliente").value = "";
    document.getElementById("observacao").value = "";
    renderCarrinho();
    carregarProdutosVenda();
  } catch (err) {
    console.error("error: aaa" + err.stack);
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível registrar a venda.",
    });
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> Finalizar Venda`;
  }
}
