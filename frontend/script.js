const API_URL = "http://localhost:3000/produtos";
let produtoEditando = null;
const token = localStorage.getItem("token");

// Validar token
if (!token) {
    window.location.href = "login.html";
}

// Função para buscar o token e validar depois
function getHeaders() {
    
    return {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
    };

}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// 🔹 Buscar produtos
/*async function carregarProdutos() {
    const resposta = await fetch("http://localhost:3000/produtos");
    const produtos = await resposta.json();

    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "";

    produtos.forEach(produto => {

        const totalEstoque = produto.quantidade * produto.preco_venda;

        lista.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.marca}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${produto.preco_custo.toFixed(2)}</td>
                <td>R$ ${produto.preco_venda.toFixed(2)}</td>
                <td>R$ ${totalEstoque.toFixed(2)}</td>
                <td>
                    <button onclick="removerProduto(${produto.id})">
                        Remover
                    </button>
                </td>
            </tr>
        `;
    });
}*/

async function carregarProdutos() {

    //const resposta = await fetch("http://localhost:3000/produtos");
    const resposta = await fetch(API_URL, {
        headers: getHeaders()
    });

    const produtos = await resposta.json();

    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = "";

    produtos.forEach(produto => {

        const precoCusto = Number(produto.preco_custo);
        const precoVenda = Number(produto.preco_venda);
        const totalEstoque = produto.quantidade * precoVenda;
        const totalLucro = (precoVenda - precoCusto) * produto.quantidade

        lista.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.codigo ?? ""}</td>
                <td>${produto.marca}</td>
                <td>${produto.quantidade}</td>
                <td>R$ ${precoCusto.toFixed(2)}</td>
                <td>R$ ${precoVenda.toFixed(2)}</td>
                <td>R$ ${totalEstoque.toFixed(2)}</td>
                <td>R$ ${totalLucro.toFixed(2)}</td>
                <td>
                    <button onclick="removerProduto(${produto.id})">
                        Remover
                    </button>
                    <button onclick='editarProduto(${JSON.stringify(produto)})'>
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

// Editar produto
async function editarProduto(produto) {
    document.getElementById("nome").value = produto.nome;
    document.getElementById("codigo").value = produto.codigo;
    document.getElementById("marca").value = produto.marca;
    document.getElementById("quantidade").value = produto.quantidade;
    document.getElementById("preco_custo").value = produto.preco_custo;
    document.getElementById("preco_venda").value = produto.preco_venda;

    // Subir até o formulário de edição
    document.getElementById("formProduto").scrollIntoView({
        behavior: "smooth"
    });

    produtoEditando = produto.id;
}

// 🔹 Adicionar produto
async function adicionarProduto() {
    const nome = document.getElementById("nome").value;
    const codigo = document.getElementById("codigo").value;
    const marca = document.getElementById("marca").value;
    const quantidade = parseInt(document.getElementById("quantidade").value);
    const preco_custo = parseFloat(document.getElementById("preco_custo").value);
    const preco_venda = parseFloat(document.getElementById("preco_venda").value);

    if (!nome || !quantidade || !preco_custo || !preco_venda) {
        //alert("Preencha todos os campos!");
        Swal.fire({
            icon: "warning",
            title: "Campos obrigatórios",
            text: "Preencha todos os campos antes de continuar."
        });
        return;
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

            await fetch("http://localhost:3000/produtos", {
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
    } catch {
        Swal.fire({
            icon: "error",
            title: "Erro",
            text: "Não foi possível adicionar o produto."
        });

    }
}


// 🔹 Remover
async function removerProduto(id) {

    /*const confirmar = confirm("Tem certeza que deseja remover este produto?");
 
    if (!confirmar) {
        return; // cancela se clicar em Cancelar
    }*/

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

        await fetch(`${API_URL}/${id}`, {
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
}

carregarProdutos();