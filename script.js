// --- 1. ESTADO GLOBAL ---
let cart = [];
let valorFrete = 0;

// Elementos do DOM
const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('carrinho');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinhoSalvo();
    vincularEventosCarrinho();
    vincularEventosPaginas();
});

// --- 3. FUNÇÕES DE NAVEGAÇÃO ---
if(cartIcon) cartIcon.onclick = () => cartSidebar.classList.add('active');
if(closeCart) closeCart.onclick = () => cartSidebar.classList.remove('active');

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const principal = document.getElementById('principal');
    const overlay = document.getElementById('overlay');

    // Alterna a classe no sidebar
    sidebar.classList.toggle('active');
    
    // Alterna a classe no container principal para empurrar o conteúdo
    principal.classList.toggle('menu-aberto');

    // Exibe ou esconde o overlay (sombra)
    if (sidebar.classList.contains('active')) {
        overlay.style.display = 'block';
    } else {
        overlay.style.display = 'none';
    }
}

// --- 4. LÓGICA DO CARRINHO ---
function addToCart(title, price, img) {
    cart.push({ title, price, img });
    renderCart();
    cartSidebar.classList.add('active');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    if (cart.length === 0) valorFrete = 0;
    renderCart();
}

function salvarCarrinho() {
    localStorage.setItem('meuCarrinho', JSON.stringify(cart));
}

function carregarCarrinhoSalvo() {
    const dados = localStorage.getItem('meuCarrinho');
    if (dados) {
        cart = JSON.parse(dados);
        renderCart();
    }
}

function atualizarContador() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.innerText = cart.length;
        if (cart.length > 0) contador.classList.add('show');
        else contador.classList.remove('show');
    }
}

// --- 5. RENDERIZAÇÃO DO CARRINHO (AQUI ESTÁ O BOTÃO) ---
function renderCart() {
    salvarCarrinho();
    atualizarContador();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <i class='bx bx-cart-alt' style="font-size: 64px; color: #ccc;"></i>
                <p>Seu carrinho está vazio.</p>
                <button onclick="cartSidebar.classList.remove('active')" style="margin-top:20px; padding:10px 20px; cursor:pointer;">Voltar para a loja</button>
            </div>`;
        if(cartTotalElement) cartTotalElement.innerText = "R$ 0,00";
        return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const total = subtotal + valorFrete;

    cartItemsContainer.innerHTML = `
        <div class="cart-container">
            <div id="items-list">
                ${cart.map((item, index) => `
                    <div class="cart-item">
                        <img src="${item.img || './imagens/camiseta.jpg'}" alt="">
                        <div class="cart-item-info">
                            <h3>${item.title}</h3>
                            <p style="color: #888; font-size: 12px;">Tamanho: M | Cor: Colorido</p>
                            <p><strong>R$ ${item.price.toFixed(2)}</strong></p>
                        </div>
                        <i class='bx bx-trash' onclick="removeFromCart(${index})" style="cursor:pointer; color: #cc0000; font-size: 20px;"></i>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="shipping-box">
                    <h4>Consultar frete e prazo</h4>
                    <div class="shipping-input-group">
                        <input type="text" id="cep-input" placeholder="00000-000" maxlength="9" value="${localStorage.getItem('cepSalvo') || ''}">
                        <button class="btn-consultar" onclick="consultarFrete()">Consultar</button>
                    </div>
                </div>
                <div class="summary-row" style="margin-top:15px">
                    <span>Subtotal (${cart.length} item)</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Frete</span>
                    <span>${valorFrete > 0 ? 'R$ ' + valorFrete.toFixed(2) : 'A consultar'}</span>
                </div>
                <div class="total-row summary-row">
                    <span>Valor total</span>
                    <span>R$ ${total.toFixed(2)}</span>
                </div>
                <div class="savings-tag">💰 Você está economizando R$ 54,00</div>
                <button id="checkout-btn" onclick="enviarWhatsApp()">Finalizar Compra</button>
            </div>
        </div>
    `;
    if(cartTotalElement) cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;
}

// --- 6. WHATSAPP E FRETE ---
function enviarWhatsApp() {
    const meuNumero = "5511999999999"; // <-- TROQUE PELO SEU NÚMERO AQUI
    let mensagem = `*Novo Pedido - Loja Uberdan*\n\n*Produtos:*\n`;
    
    cart.forEach(item => { mensagem += `- ${item.title}: R$ ${item.price.toFixed(2)}\n`; });

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    mensagem += `\n*Total:* R$ ${(subtotal + valorFrete).toFixed(2)}`;

    const url = `https://api.whatsapp.com/send?phone=${meuNumero}&text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
}

async function consultarFrete() {
    const input = document.getElementById('cep-input');
    if(!input) return;
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) { alert("CEP Inválido"); return; }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await response.json();
        if (dados.erro) throw new Error();

        valorFrete = 11.95;
        localStorage.setItem('cepSalvo', cep);
        renderCart();
    } catch {
        alert("Erro ao buscar CEP.");
    }
}

// --- 7. EVENTOS DA LOJA ---
function vincularEventosCarrinho() {
    document.querySelectorAll('.add-cart').forEach(button => {
        button.onclick = (e) => {
            const box = e.target.closest('.product-box');
            const title = box.querySelector('.product-title').innerText;
            const priceText = box.querySelector('.price').innerText.replace('R$', '').replace('$', '').trim();
            const img = box.querySelector('.product-img').src;
            addToCart(title, parseFloat(priceText), img);
        };
    });
}

function vincularEventosPaginas() {
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.onclick = function() {
            const n = this.innerText;
            // Aqui você chamaria a função de carregar produtos da página N
            console.log("Página " + n);
        };
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const paginationContainer = document.querySelector(".pagination");
    const pageNumbers = document.querySelectorAll(".page-number");
    const prevBtn = document.querySelector(".btn-nav:first-child");
    const nextBtn = document.querySelector(".btn-nav:last-child");

    let currentPage = 1;
    const totalPages = pageNumbers.length;

    function updatePagination(newPage) {
        if (newPage < 1 || newPage > totalPages) return;

        currentPage = newPage;

        // Atualiza a classe active nos números
        pageNumbers.forEach((num, index) => {
            num.classList.toggle("active", index + 1 === currentPage);
        });

        // Desativa botões de navegação se chegar nos limites
        prevBtn.classList.toggle("disabled", currentPage === 1);
        nextBtn.classList.toggle("disabled", currentPage === totalPages);

        // Aqui você chamaria a função para carregar os produtos da página 'currentPage'
        console.log("Navegando para a página:", currentPage);
    }

    // Clique nos números
    pageNumbers.forEach((num, index) => {
        num.addEventListener("click", () => updatePagination(index + 1));
    });

    // Clique no Anterior
    prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        updatePagination(currentPage - 1);
    });

    // Clique no Próxima
    nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        updatePagination(currentPage + 1);
    });
}); 
// --- LÓGICA DE PESQUISA DINÂMICA ---
const inputPesquisa = document.getElementById('carrinho-pesquisa');
const listaResultados = document.getElementById('search-results');

inputPesquisa.addEventListener('input', () => {
    const termo = inputPesquisa.value.toLowerCase();
    listaResultados.innerHTML = ''; // Limpa resultados anteriores

    if (termo.length > 0) {
        // Pega todos os produtos que estão no HTML no momento
        const produtos = document.querySelectorAll('.product-box');
        let achou = false;

        produtos.forEach(produto => {
            const nome = produto.querySelector('.product-title').innerText;
            const preco = produto.querySelector('.price').innerText;
            const imagem = produto.querySelector('.product-img').src;

            if (nome.toLowerCase().includes(termo)) {
                achou = true;
                const item = document.createElement('div');
                item.className = 'search-item';
                item.innerHTML = `
                    <img src="${imagem}">
                    <div>
                        <strong>${nome}</strong><br>
                        <small>${preco}</small>
                    </div>
                `;              
                // Ao clicar no item da pesquisa
                item.onclick = () => {
                    inputPesquisa.value = nome;
                    listaResultados.style.display = 'none';
                    // Scroll até o produto original na página
                    produto.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    produto.style.border = "2px solid #ff0000"; // Destaque temporário
                    setTimeout(() => produto.style.border = "none", 2000);
                };

                listaResultados.appendChild(item);
            }
        });

        listaResultados.style.display = achou ? 'block' : 'none';
    } else {
        listaResultados.style.display = 'none';
    }
});
// Fechar lista ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target !== inputPesquisa) {
        listaResultados.style.display = 'none';
    }
});

function atualizarContador() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.innerText = cart.length;
        // Mostra o contador apenas se houver itens
        if (cart.length > 0) {
            contador.classList.add('show');
        } else {
            contador.classList.remove('show');
        }
    }
}

// --- LÓGICA DO MODAL DE LOGIN ---
const loginModal = document.getElementById('login-modal');
const loginBtn = document.querySelector('.login-container'); // O container que criamos antes
const closeLogin = document.getElementById('close-login');

// Abrir modal
if (loginBtn) {
    loginBtn.onclick = () => {
        loginModal.style.display = 'flex';
    };
}

// Fechar ao clicar no X
if (closeLogin) {
    closeLogin.onclick = () => {
        loginModal.style.display = 'none';
    };
}

// Fechar ao clicar fora do modal
window.onclick = (event) => {
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
}

// Simular Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        alert(`Bem-vindo, ${email}! Login realizado com sucesso.`);
        loginModal.style.display = 'none';
    };
}

// --- ELEMENTOS ---
const registerModal = document.getElementById('register-modal');
const btnGoToRegister = document.querySelector('.form-footer a'); // Link no modal de login
const btnGoToLogin = document.getElementById('go-to-login'); // Link no modal de cadastro

// --- ABRIR/FECHAR CADASTRO ---
btnGoToRegister.onclick = (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
};

btnGoToLogin.onclick = (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
};

// --- SALVAR CADASTRO (Lógica de Persistência) ---
document.getElementById('register-form').onsubmit = (e) => {
    e.preventDefault();
    
    const newUser = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value
    };

    // Salva no LocalStorage como uma string JSON
    localStorage.setItem('usuarioCadastrado', JSON.stringify(newUser));
    
    alert("Conta criada com sucesso! Agora faça seu login.");
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
};

// --- VALIDAR LOGIN ---
document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    
    const emailLogin = document.getElementById('email').value;
    const passLogin = document.getElementById('password').value;
    
    // Recupera os dados salvos
    const userSalvo = JSON.parse(localStorage.getItem('usuarioCadastrado'));

    if (userSalvo && emailLogin === userSalvo.email && passLogin === userSalvo.password) {
        alert(`Bem-vindo, ${userSalvo.name}!`);
        loginModal.style.display = 'none';
        
        // Atualiza o texto "Entrar" no cabeçalho para o nome do usuário
        document.querySelector('.login-container span').innerText = `Olá, ${userSalvo.name.split(' ')[0]}`;
    } else {
        alert("E-mail ou senha incorretos!");
    }
};

// --- ELEMENTOS ---
const ordersModal = document.getElementById('orders-modal');
const openOrdersBtn = document.getElementById('open-orders');
const closeOrdersBtn = document.getElementById('close-orders');
const ordersListContainer = document.getElementById('orders-list');

// --- FUNÇÃO PARA SALVAR O PEDIDO (Chame isso dentro da sua função enviarWhatsApp) ---
function registrarPedido() {
    if (cart.length === 0) return;

    const listaPedidos = JSON.parse(localStorage.getItem('meusPedidos')) || [];
    
    const novoPedido = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleDateString('pt-BR'),
        itens: [...cart], // Copia os itens atuais do carrinho
        total: cart.reduce((acc, item) => acc + item.price, 0) + valorFrete
    };

    listaPedidos.unshift(novoPedido); // Adiciona no topo da lista
    localStorage.setItem('meusPedidos', JSON.stringify(listaPedidos));
}

// Atualize sua função enviarWhatsApp para incluir o registro:
const originalEnviarWhatsApp = enviarWhatsApp;
enviarWhatsApp = function() {
    registrarPedido(); // Salva localmente
    originalEnviarWhatsApp(); // Abre o WhatsApp
}

// --- FUNÇÃO PARA RENDERIZAR PEDIDOS ---
function renderizarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('meusPedidos')) || [];
    
    if (pedidos.length === 0) {
        ordersListContainer.innerHTML = "<p style='text-align:center;'>Você ainda não realizou pedidos.</p>";
        return;
    }

    ordersListContainer.innerHTML = pedidos.map(pedido => `
        <div class="order-card">
            <div class="order-header">
                <span>Pedido #${pedido.id}</span>
                <span>Data: ${pedido.data}</span>
            </div>
            <div class="order-body">
                ${pedido.itens.map(item => `
                    <div class="order-item-mini">
                        <img src="${item.img}" alt="">
                        <span>${item.title}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total-info">
                Total: R$ ${pedido.total.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// --- EVENTOS DO MODAL ---
openOrdersBtn.onclick = (e) => {
    e.preventDefault();
    toggleMenu(); // Fecha o sidebar
    renderizarPedidos();
    ordersModal.style.display = 'flex';
};

closeOrdersBtn.onclick = () => ordersModal.style.display = 'none';

// --- LÓGICA PARA LIMPAR PEDIDOS ---
const clearOrdersBtn = document.getElementById('clear-orders-btn');

if (clearOrdersBtn) {
    clearOrdersBtn.onclick = () => {
        // Pede confirmação para o utilizador não apagar sem querer
        if (confirm("Tem certeza que deseja apagar todo o seu histórico de pedidos?")) {
            localStorage.removeItem('meusPedidos'); // Remove apenas os pedidos
            renderizarPedidos(); // Atualiza a lista para mostrar que está vazia
        }
    };
}

// Pequena melhoria na função renderizarPedidos para esconder o botão se não houver pedidos
function renderizarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('meusPedidos')) || [];
    const clearBtn = document.getElementById('clear-orders-btn');
    
    if (pedidos.length === 0) {
        ordersListContainer.innerHTML = `
            <div style="text-align:center; padding: 40px; color: #888;">
                <i class='bx bx-info-circle' style="font-size: 40px;"></i>
                <p>Ainda não realizou nenhum pedido.</p>
            </div>`;
        if (clearBtn) clearBtn.style.display = 'none'; // Esconde o botão limpar
        return;
    }

    if (clearBtn) clearBtn.style.display = 'inline-block'; // Mostra o botão se houver pedidos

    ordersListContainer.innerHTML = pedidos.map(pedido => `
        <div class="order-card">
            <div class="order-header">
                <span>ID: #${pedido.id}</span>
                <span>Data: ${pedido.data}</span>
            </div>
            <div class="order-body">
                ${pedido.itens.map(item => `
                    <div class="order-item-mini">
                        <img src="${item.img}" alt="">
                        <span>${item.title}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total-info">
                Total: R$ ${pedido.total.toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Abrir detalhes do produto
function openProductDetails(title, price, img) {
    const modal = document.getElementById('product-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-price').innerText = `R$ ${price.toFixed(2)}`;
    document.getElementById('modal-img').src = img;
    
    modal.style.display = 'flex';

    // Configura o botão de comprar do modal
    document.getElementById('modal-add-cart').onclick = () => {
        addToCart(title, price, img);
        modal.style.display = 'none';
    };
}

// Fechar modal
document.getElementById('close-product').onclick = () => {
    document.getElementById('product-modal').style.display = 'none';
};

// Víncular clique na imagem do produto (Atualize sua função vincularEventosCarrinho)
function vincularEventosProdutos() {
    document.querySelectorAll('.product-box').forEach(box => {
        const img = box.querySelector('.product-img');
        const titleElement = box.querySelector('.product-title');
        
        const title = titleElement.innerText;
        const price = parseFloat(box.querySelector('.price').innerText.replace('$', '').replace('R$', ''));
        const imgSrc = img.src;

        // Ao clicar na imagem ou no título, abre o detalhe
        [img, titleElement].forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = () => openProductDetails(title, price, imgSrc);
        });
    });
}

// Chame essa função no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    vincularEventosProdutos();
});