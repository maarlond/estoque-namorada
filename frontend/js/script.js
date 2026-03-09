// ------------------------------
// PRODUTOS
// ------------------------------
const API_URL = window.location.origin;
let produtoEditando = null;

// ------------------------------
// TOKEN PARA REQUISIÇÕES
// ------------------------------
const token = localStorage.getItem("token");
const pathAtual = window.location.pathname;
const btnLogout = document.getElementById("btnLogout");

if (!token && pathAtual !== "/login.html" && pathAtual !== "/cadastro.html") {
    window.location.href = "login.html";
}

function validarCampos() {

    let valido = true;

    const nome = document.getElementById("nome");
    const codigo = document.getElementById("codigo");
    const quantidade = document.getElementById("quantidade");
    const custo = document.getElementById("preco_custo");
    const venda = document.getElementById("preco_venda");

    const campos = [nome, codigo, quantidade, custo, venda];

    // remove erro antigo
    campos.forEach(c => c.classList.remove("campo-erro"));

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
    }

    if (!valido) {

        Swal.fire({
            icon: "warning",
            title: "Preencha os campos obrigatórios",
            text: "Os campos em vermelho precisam ser corrigidos."
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
        cancelButtonColor: "#3085d6"
    });

    if (resultado.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}

function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
    };
}

// --- TEXTO EXEMPLO DINÂMICO ---
const div = document.getElementById("textoExemplo");
const typingContainer = document.getElementById("typingContainer");

if (div) {

    const frases = [
        "Desperte sua essência — o perfume certo transforma qualquer momento em uma lembrança inesquecível.",
        "Perfume é mais que aroma, é identidade. Encontre o seu e marque presença por onde passar.",
        "Cada fragrância conta uma história — qual será a sua?"
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
}

// ------------------------------
// DATATABLE
// ------------------------------
let tabela;
$(document).ready(function () {
    tabela = $('#tabelaProdutos').DataTable({
        pageLength: 10,
        responsive: true,
        columnDefs: [
            { orderable: false, targets: 8 } // botão ação não é ordenável
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/pt-BR.json"
        }
    });

    carregarProdutos();
});

// ------------------------------
// CARREGAR PRODUTOS
// ------------------------------
async function carregarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`, { headers: getHeaders() });
        if (!resposta.ok) throw new Error("Erro ao buscar produtos");
        const produtos = await resposta.json();

        tabela.clear();

        let totalEstoque = 0;
        let totalLucro = 0;

        produtos.forEach(produto => {
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
                 <button class="btnRemover" onclick='removerProduto(${produto.id})'>Remover</button>`
            ]);
        });

        tabela.draw();

        // Atualizar footer
        document.getElementById("totalEstoque").textContent = `R$ ${totalEstoque.toFixed(2)}`;
        document.getElementById("totalLucro").textContent = `R$ ${totalLucro.toFixed(2)}`;

    } catch (err) {
        console.error(err);
        Swal.fire("Erro", "Não foi possível carregar os produtos.", "error");
    }
}

async function editarProduto(produto) {

    document.getElementById("nome").value = produto.nome;
    document.getElementById("codigo").value = produto.codigo;
    document.getElementById("marca").value = produto.marca;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("preco_custo").value = produto.preco_custo;
    document.getElementById("preco_venda").value = produto.preco_venda;

    // Muda o texto do botão
    const botao = document.getElementById("btnAdicionar");
    botao.textContent = "Editar";

    // Scroll até o formulário
    document.getElementById("formProduto")?.scrollIntoView({
        behavior: "smooth"
    });

    produtoEditando = produto.id;
}

async function adicionarProduto() {

    if (!validarCampos()) return;

    const nome = document.getElementById("nome").value;
    const codigo = document.getElementById("codigo").value;
    const marca = document.getElementById("marca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const preco_custo = parseFloat(document.getElementById("preco_custo").value);
    const preco_venda = parseFloat(document.getElementById("preco_venda").value);

    // Validação manual
    const erros = [];
    if (!nome) erros.push("Nome do produto é obrigatório");
    if (!codigo) erros.push("Código é obrigatório");
    if (!marca) erros.push("Marca é obrigatória");
    if (!quantidade || quantidade <= 0) erros.push("Quantidade inválida");
    if (!preco_custo || preco_custo < 0) erros.push("Preço de custo inválido");
    if (!preco_venda || preco_venda < 0) erros.push("Preço de venda inválido");

    if (erros.length > 0) {
        Swal.fire({
            icon: "warning",
            title: "Favor, preencher os campos informados",
            html: erros.map(e => `<div style="color: red;">• ${e}</div>`).join("")
        });
        return; // sai da função se tiver erro
    }

    Swal.fire({
        title: produtoEditando ? "Atualizando..." : "Salvando...",
        text: "Aguarde um momento",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        if (produtoEditando) {

            console.log({
                nome,
                codigo,
                marca,
                quantidade,
                preco_custo,
                preco_venda
            });

            // EDITAR
            await fetch(`${API_URL}/${produtoEditando}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({
                    nome,
                    codigo,
                    marca,
                    quantidade,
                    preco_custo,
                    preco_venda
                })
            });
            produtoEditando = null;

            Swal.fire({
                icon: "success",
                title: "Produto atualizado!",
                timer: 1500,
                showConfirmButton: false
            });

        } else {

            await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    nome,
                    codigo,
                    marca,
                    quantidade,
                    preco_custo,
                    preco_venda
                })
            });

            Swal.fire({
                icon: "success",
                title: "Produto adicionado!",
                timer: 1500,
                showConfirmButton: false
            });
        }
        limparFormulario();
        carregarProdutos();
    } catch (err) {
        console.error(err); // importante para ver o que deu errado
        Swal.close();
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Não foi possível adicionar o produto."
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
        cancelButtonColor: "#3085d6"
    });

    if (resultado.isConfirmed) {

        await fetch(`${API_URL}/produtos/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });

        Swal.fire(
            "Removido!",
            "Produto removido com sucesso.",
            "success"
        );
    }
    carregarProdutos()
}

function limparFormulario() {
    document.getElementById("nome").value = "";
    document.getElementById("codigo").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("preco_custo").value = "";
    document.getElementById("preco_venda").value = "";

    produtoEditando = null;

    document.getElementById("btnAdicionar").textContent = "Adicionar";
}

if (document.getElementById("listaProdutos")) {
    carregarProdutos();
}