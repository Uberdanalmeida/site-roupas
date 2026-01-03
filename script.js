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
    const overlay = document.getElementById('overlay');   
    sidebar.classList.toggle('active');   
    overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
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