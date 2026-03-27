// ------------------------------
// PRODUTOS
// ------------------------------
var produtoEditando = null;

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

function initProdutos() {
  configurarFormularioProduto();
  iniciarTabelaProdutos();
}

function configurarFormularioProduto() {
  const form = document.getElementById("formProduto");

  if (!form) {
    return;
  }

  form.removeEventListener("submit", handleSubmitProduto);
  form.addEventListener("submit", handleSubmitProduto);
}

function handleSubmitProduto(e) {
  e.preventDefault();
  console.log("🔥 submit funcionando");
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

  console.log("API_URL produtos" , API_URL)
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

/*document.addEventListener("DOMContentLoaded", () => {
  var form = document.getElementById("formProduto");
  console.log(
    "Entrou aqui -> document.addEventListener('DOMContentLoaded', () => {",
  );

  console.log("formformform: " + form)

  if (form) {
    console.log("Entrou aqui -> aaaaa");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      adicionarProduto();
    });
  }
});*/

async function adicionarProduto() {
  console.log("Entrou aqui -> adicionarProduto");

  if (!validarCampos()) return;

  const nome = document.getElementById("nome").value;
  const codigo = document.getElementById("codigo").value;
  const marca = document.getElementById("marca").value;
  const quantidade = parseInt(document.getElementById("quantidade").value);
  const preco_custo = parseFloat(document.getElementById("preco_custo").value);
  const preco_venda = parseFloat(document.getElementById("preco_venda").value);

  const imagemProduto = document.getElementById("imagemProduto").files[0];

  const formData = new FormData();

  formData.append("nome", nome);
  formData.append("codigo", codigo);
  formData.append("marca", marca);
  formData.append("quantidade", quantidade);
  formData.append("preco_custo", preco_custo);
  formData.append("preco_venda", preco_venda);

  if (imagemProduto) {
    formData.append("imagemProduto", imagemProduto); // ✅ só uma vez
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
    if (produtoEditando) {
      console.log({
        nome,
        codigo,
        marca,
        quantidade,
        preco_custo,
        preco_venda,
      });

      // EDITAR
      await fetch(`${API_URL}/produtos/${produtoEditando}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          nome,
          codigo,
          marca,
          quantidade,
          preco_custo,
          preco_venda,
        }),
      });
      produtoEditando = null;

      Swal.fire({
        icon: "success",
        title: "Produto atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await fetch(`${API_URL}/produtos`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token, // 🔥 só isso
        },
        body: formData, // 🔥 aqui é o segredo
      });

      Swal.fire({
        icon: "success",
        title: "Produto adicionado!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    limparFormulario();
    carregarProdutos();
    fecharModalProduto();
  } catch (err) {
    console.error(err); // importante para ver o que deu errado
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível adicionar o produto.",
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
    await fetch(`${API_URL}/produtos/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    Swal.fire("Removido!", "Produto removido com sucesso.", "success");
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

  produtoEditando = null;
}

function abrirModalProduto() {
  const modal = document.getElementById("modalProduto");
  if (!modal) return;
  produtoEditando = null;
  document.getElementById("formProduto").reset();
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

  produtoEditando = produto.id;

  document.getElementById("modalProduto").style.display = "flex";
}
