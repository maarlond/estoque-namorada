// ------------------------------
// PRODUTOS
// ------------------------------
var produtoEditando = null;

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function initProdutos() {
  configurarFormularioProduto();
  iniciarTabelaProdutos();
}
function configurarFormularioProduto() {
  const form = document.getElementById("formProduto");

  console.log("Form produto encontrado?", form);

  if (!form) {
    return;
  }

  form.removeEventListener("submit", handleSubmitProduto);
  form.addEventListener("submit", handleSubmitProduto);
}

function handleSubmitProduto(e) {
  console.log("Submit do produto disparou");

  e.preventDefault();
  adicionarProduto();
}

// ------------------------------
// DATATABLE
// ------------------------------
var tabela;
function iniciarTabelaProdutos() {
  if (!$("#tabelaProdutos").length) return; // ← sai se a tabela não existir

  tabela = $("#tabelaProdutos").DataTable({
    pageLength: 10,
    responsive: true,
    autoWidth: false,
    columnDefs: [{ orderable: false, targets: 8 }],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json",
    },
  });

  carregarProdutos();
}

// ------------------------------
// CARREGAR PRODUTOS
// ------------------------------
async function carregarProdutos() {
  if (!tabela) return; //

  try {
    const resposta = await fetch(`${API_URL}/produtos`, {
      headers: getHeaders(),
    });
    if (!resposta.ok) throw new Error("Erro ao buscar produtos");
    const produtos = await resposta.json();

    tabela.clear();

    let totalEstoque = 0;
    let totalLucro = 0;

    produtos.forEach((produto) => {
      const precoCusto = Number(produto.preco_custo);
      const precoVenda = Number(produto.preco_venda);
      const estoque = produto.quantidade * precoVenda;
      const lucro = (precoVenda - precoCusto) * produto.quantidade;

      totalEstoque += estoque;
      totalLucro += lucro;

      tabela.row.add([
        produto.nome,
        produto.codigo ?? "",
        produto.marca,
        produto.quantidade,
        `R$ ${precoCusto.toFixed(2)}`,
        `R$ ${precoVenda.toFixed(2)}`,
        `R$ ${estoque.toFixed(2)}`,
        `R$ ${lucro.toFixed(2)}`,
        `<button class="btnEditar" onclick='editarProduto(${JSON.stringify(produto)})'>Editar</button>
                 <button class="btnRemover" onclick='removerProduto(${produto.id})'>Remover</button>`,
      ]);
    });

    tabela.draw();

    // Atualizar footer
    document.getElementById("totalEstoque").textContent =
      `R$ ${totalEstoque.toFixed(2)}`;
    document.getElementById("totalLucro").textContent =
      `R$ ${totalLucro.toFixed(2)}`;
  } catch (err) {
    console.error(err);
    //Swal.fire("Erro", "Não foi possível carregar os produtos.", "error");
  }
}

async function adicionarProduto() {
  console.log("Entrou em adicionarProduto");

  if (!validarCampos()) {
    console.warn("Parou no validarCampos()");
    return;
  }

  console.log("Passou pela validação");

  // restante da função...

  const token = localStorage.getItem("token");

  const nome = document.getElementById("nome").value;
  const codigo = document.getElementById("codigo").value;
  const marca = document.getElementById("marca").value;
  const quantidade = parseInt(document.getElementById("quantidade").value);
  const preco_custo = parseFloat(document.getElementById("preco_custo").value);
  const preco_venda = parseFloat(document.getElementById("preco_venda").value);
  const descricao = document.getElementById("descricao")?.value || "";

  const precoPromocionalInput = document.getElementById("preco_promocional");
  const promocaoAtivaInput = document.getElementById("promocao_ativa");

  const promocao_ativa = promocaoAtivaInput?.value === "true";

  const status_entrega =
    document.getElementById("status_entrega")?.value || "pronta_entrega";
  const preco_promocional =
    precoPromocionalInput && precoPromocionalInput.value
      ? parseFloat(precoPromocionalInput.value)
      : null;

  if (promocao_ativa) {
    if (!preco_promocional || preco_promocional <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Preço promocional inválido",
        text: "Informe um preço promocional válido.",
      });
      return;
    }

    if (preco_promocional >= preco_venda) {
      Swal.fire({
        icon: "warning",
        title: "Promoção inválida",
        text: "O preço promocional precisa ser menor que o preço de venda.",
      });
      return;
    }
  }

  const imagemProduto = document.getElementById("imagemProduto");

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("codigo", codigo);
  formData.append("marca", marca);
  formData.append("quantidade", quantidade);
  formData.append("preco_custo", preco_custo);
  formData.append("preco_venda", preco_venda);
  formData.append("descricao", descricao);
  formData.append("status_entrega", status_entrega);

  formData.append("promocao_ativa", promocao_ativa ? "true" : "false");

  if (preco_promocional !== null) {
    formData.append("preco_promocional", preco_promocional);
  }

  if (imagemProduto && imagemProduto.files.length > 0) {
    formData.append("imagemProduto", imagemProduto.files[0]);
  }

  Swal.fire({
    title: produtoEditando ? "Atualizando..." : "Salvando...",
    text: "Aguarde um momento",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const url = produtoEditando
      ? `${API_URL}/produtos/${produtoEditando}`
      : `${API_URL}/produtos`;

    const method = produtoEditando ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    });

    if (!response.ok) {
      const erro = await response.json();
      console.error("Erro backend:", erro);
      throw new Error(erro.error || "Erro ao salvar produto.");
    }

    console.log("API_URL:", API_URL);

    for (let item of formData.entries()) {
      console.log(item[0], item[1]);
    }

    if (!response.ok) {
      let erroTexto = "Erro ao salvar produto.";

      try {
        const erro = await response.json();
        erroTexto = erro.message || erro.error || erroTexto;
      } catch (e) {}

      throw new Error(erroTexto);
    }

    produtoEditando = null;

    Swal.fire({
      icon: "success",
      title: method === "PUT" ? "Produto atualizado!" : "Produto adicionado!",
      timer: 1500,
      showConfirmButton: false,
    });

    limparFormulario();
    carregarProdutos();
    fecharModalProduto();
  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Erro",
      text: err.message || "Não foi possível salvar o produto.",
    });
  }
}

async function removerProduto(id) {
  const resultado = await Swal.fire({
    title: "Tem certeza?",
    text: `Deseja remover o produto?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, remover",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });

  if (resultado.isConfirmed) {
    try {
      const response = await fetch(`${API_URL}/produtos/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(
          erro.message ||
            "Problema ao deletar, verifique se o produto não está com vendas cadastradas",
        );
      }

      Swal.fire("Removido!", "Produto removido com sucesso.", "success");

      // 🔥 Atualiza a lista depois de deletar
      carregarProdutos();
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Erro ao remover",
        text: err.message,
      });
    }
  }
  carregarProdutos();
}
function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("codigo").value = "";
  document.getElementById("marca").value = "";
  document.getElementById("quantidade").value = "";
  document.getElementById("preco_custo").value = "";
  document.getElementById("preco_venda").value = "";

  if (document.getElementById("descricao")) {
    document.getElementById("descricao").value = "";
  }

  if (document.getElementById("preco_promocional")) {
    document.getElementById("preco_promocional").value = "";
  }

  if (document.getElementById("promocao_ativa")) {
    document.getElementById("promocao_ativa").value = "false";
  }

  if (document.getElementById("status_entrega")) {
    document.getElementById("status_entrega").value = "pronta_entrega";
  }
  produtoEditando = null;
}
function abrirModalProduto() {
  const modal = document.getElementById("modalProduto");
  if (!modal) return;

  produtoEditando = null;
  document.getElementById("formProduto").reset();

  document.getElementById("preco_promocional").value = "";
  document.getElementById("promocao_ativa").value = "false";
  document.getElementById("status_entrega").value = "pronta_entrega";
  modal.style.display = "flex";
}

function fecharModalProduto() {
  const modal = document.getElementById("modalProduto");
  if (!modal) return;
  modal.style.display = "none";
}

function editarProduto(produto) {
  document.getElementById("nome").value = produto.nome;
  document.getElementById("codigo").value = produto.codigo || "";
  document.getElementById("marca").value = produto.marca;
  document.getElementById("quantidade").value = produto.quantidade;
  document.getElementById("preco_custo").value = produto.preco_custo;
  document.getElementById("preco_venda").value = produto.preco_venda;

  if (document.getElementById("descricao")) {
    document.getElementById("descricao").value = produto.descricao || "";
  }

  if (document.getElementById("preco_promocional")) {
    document.getElementById("preco_promocional").value =
      produto.preco_promocional || "";
  }

  if (document.getElementById("promocao_ativa")) {
    document.getElementById("promocao_ativa").value = produto.promocao_ativa
      ? "true"
      : "false";
  }

  if (document.getElementById("status_entrega")) {
    document.getElementById("status_entrega").value =
      produto.status_entrega || "pronta_entrega";
  }

  produtoEditando = produto.id;

  document.getElementById("modalProduto").style.display = "flex";
}
