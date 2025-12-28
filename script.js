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
function MostrarMenu() {
    const lateral = document.getElementById('Lateral');
    lateral.style.display = (lateral.style.display === 'none') ? 'block' : 'none';
}