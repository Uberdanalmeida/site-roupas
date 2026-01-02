let cart = [];
// Selecionar elementos
const cartSidebar = document.getElementById('cart-sidebar');
const cartIcon = document.getElementById('carrinho');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
// Abrir e fechar carrinho
cartIcon.onclick = () => cartSidebar.classList.add('active');
closeCart.onclick = () => cartSidebar.classList.remove('active');
// Adicionar ao carrinho
document.querySelectorAll('.add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        const productBox = e.target.parentElement;
        const title = productBox.querySelector('.product-title').innerText;
        const price = productBox.querySelector('.price').innerText.replace('$', '');       
        addToCart(title, parseFloat(price));
        cartSidebar.classList.add('active'); // Abre o carrinho aoadicionar
    });
});

function addToCart(title, price) {
    cart.push({ title, price });
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <span>${item.title}</span>
                <span>$${item.price.toFixed(2)}</span>
            </div>
        `;
    });

    cartTotalElement.innerText = `$${total.toFixed(2)}`;
}
// Sua função original do Menu Lateral corrigida
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');   
    // Alterna a classe 'active' no sidebar
    sidebar.classList.toggle('active');   
    // Mostra ou esconde o fundo escuro
    if (sidebar.classList.contains('active')) {
        overlay.style.display = 'block';
    } else {
        overlay.style.display = 'none';
    }
}
// Lista de produtos para simular as páginas
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

function carregarProdutos(pagina) {
    const shopContent = document.querySelector('.shop-content');
    shopContent.innerHTML = ""; // Limpa a página atual
    // Simula a troca de produtos (aqui você poderia filtrar ou mudar os nomes)
    produtosPadrao.forEach(prod => {
        const productBox = document.createElement('div');
        productBox.classList.add('product-box');
        
        productBox.innerHTML = `
            <img src="${prod.img}" alt="" class="product-img">
            <h2 class="product-title">${prod.title} (Pág ${pagina})</h2>
            <span class="price">$${prod.price.toFixed(2)}</span>
            <i class='bx bx-shopping-bag add-cart'></i>
        `;
        
        shopContent.appendChild(productBox);
    });
    // Reatribui o evento de clique nos novos botões de "Adicionar ao Carrinho"
    vincularEventosCarrinho();
}
// Função para os botões de compra funcionarem em produtos novos
function vincularEventosCarrinho() {
    document.querySelectorAll('.add-cart').forEach(button => {
        button.onclick = (e) => {
            const productBox = e.target.parentElement;
            const title = productBox.querySelector('.product-title').innerText;
            const price = productBox.querySelector('.price').innerText.replace('$', '');
            
            addToCart(title, parseFloat(price));
            cartSidebar.classList.add('active');
        };
    });
}
// Configuração dos botões de número de página
document.querySelectorAll('.page-number').forEach(button => {
    button.addEventListener('click', function() {
        const nPagina = this.innerText;       
        // Estilo visual dos botões
        document.querySelectorAll('.page-number').forEach(p => p.classList.remove('active'));
        this.classList.add('active');   
        // Carrega os "novos" produtos
        carregarProdutos(nPagina);   
        // Sobe a tela
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});