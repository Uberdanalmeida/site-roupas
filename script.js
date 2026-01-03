// --- 1. CONFIGURAÇÕES E ESTADO GLOBAL ---
let cart = [];
let valorFrete = 0;

const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('carrinho');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

const produtosPadrao = [
    { title: "Camiseta", price: 40.00, img: "./imagens/camiseta.jpg" },
    { title: "Sapato", price: 79.90, img: "./imagens/sapato.jpg" },
    { title: "Camiseta V2", price: 39.90, img: "./imagens/camiseta.jpg" },
    { title: "Tênis", price: 150.00, img: "./imagens/sapato.jpg" },
    { title: "Chinelo", price: 50.00, img: "./imagens/camiseta.jpg" },
    { title: "Bicicleta", price: 1550.00, img: "./imagens/sapato.jpg" },
    { title: "Calça", price: 59.90, img: "./imagens/camiseta.jpg" },
    { title: "Blusa", price: 80.00, img: "./imagens/sapato.jpg" }
];

// --- 2. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinhoSalvo();
    vincularEventosPaginas();
    vincularEventosCarrinho(); // Garante que os produtos iniciais do HTML funcionem
});

// --- 3. FUNÇÕES DE INTERFACE (MENU E CARRINHO) ---
cartIcon.onclick = () => cartSidebar.classList.add('active');
closeCart.onclick = () => cartSidebar.classList.remove('active');

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

function atualizarContador() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.innerText = cart.length;
        contador.classList.toggle('show', cart.length > 0);
    }
}

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
        cartTotalElement.innerText = "R$ 0,00";
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
                <button id="checkout-btn">Finalizar Compra</button>
            </div>
        </div>
    `;
    cartTotalElement.innerText = `R$ ${total.toFixed(2)}`;
}

// --- 5. FRETE E API ---
async function consultarFrete() {
    const input = document.getElementById('cep-input');
    const cep = input.value.replace(/\D/g, '');

    if (cep.length !== 8) {
        alert("Digite um CEP válido.");
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await response.json();

        if (dados.erro) throw new Error();

        valorFrete = 11.95;
        localStorage.setItem('cepSalvo', cep);
        renderCart();

        const box = document.querySelector('.shipping-box');
        const info = document.createElement('p');
        info.style.cssText = "font-size: 12px; color: #555; margin-top: 10px;";
        info.innerHTML = `📍 ${dados.logradouro}, ${dados.localidade}-${dados.uf}<br><strong>Chega em até 5 dias úteis</strong>`;
        box.appendChild(info);

    } catch {
        alert("Erro ao buscar CEP.");
    }
}

// --- 6. PERSISTÊNCIA (LOCALSTORAGE) ---
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

// --- 7. LOJA E PAGINAÇÃO ---
function vincularEventosCarrinho() {
    document.querySelectorAll('.add-cart').forEach(button => {
        button.onclick = (e) => {
            const box = e.target.closest('.product-box');
            const title = box.querySelector('.product-title').innerText;
            const price = parseFloat(box.querySelector('.price').innerText.replace(/[R$ ]/g, ''));
            const img = box.querySelector('.product-img').src;
            addToCart(title, price, img);
        };
    });
}

function carregarProdutos(pagina) {
    const shopContent = document.querySelector('.shop-content');
    shopContent.innerHTML = produtosPadrao.map(prod => `
        <div class="product-box">
            <img src="${prod.img}" alt="" class="product-img">
            <h2 class="product-title">${prod.title} (Pág ${pagina})</h2>
            <span class="price">R$ ${prod.price.toFixed(2)}</span>
            <i class='bx bx-shopping-bag add-cart'></i>
        </div>
    `).join('');
    vincularEventosCarrinho();
}

function vincularEventosPaginas() {
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.page-number').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            carregarProdutos(this.innerText);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    });
}