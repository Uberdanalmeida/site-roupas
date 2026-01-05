let cart = [];

// Seleção de elementos
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');

// Abrir e fechar carrinho
document.getElementById('carrinho').onclick = () => cartSidebar.classList.add('active');
document.getElementById('close-cart').onclick = () => cartSidebar.classList.remove('active');

// Função para adicionar ao carrinho
function addToCart(title, price, img) {
    cart.push({ title, price: parseFloat(price), img });
    renderCart();
    cartSidebar.classList.add('active'); // Abre o carrinho ao adicionar
}

// Função para remover
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// Atualizar a visualização
function renderCart() {
    // Atualiza a bolinha vermelha
    cartCount.innerText = cart.length;
    cartCount.style.display = cart.length > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; padding:20px;">Carrinho vazio</p>';
        cartTotalElement.innerText = "R$ 0,00";
        return;
    }

    // Gera a lista de itens
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#fff; padding:10px;">
            <img src="${item.img}" style="width:50px; height:60px; object-fit:cover;">
            <div style="flex:1">
                <h4 style="font-size:14px;">${item.title}</h4>
                <p>R$ ${item.price.toFixed(2)}</p>
            </div>
            <i class='bx bx-trash' onclick="removeFromCart(${index})" style="cursor:pointer; color:red;"></i>
        </div>
    `).join('');

    // Calcula o total
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    cartTotalElement.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função do Menu Lateral
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').style.display = 
        document.getElementById('sidebar').classList.contains('active') ? 'block' : 'none';
}

// Função para finalizar a compra
document.getElementById('checkout-btn').onclick = function() {
    if (cart.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

    // Criar o objeto do pedido
    const novoPedido = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleDateString('pt-BR'),
        itens: [...cart],
        total: cart.reduce((acc, item) => acc + item.price, 0)
    };

    // Salvar no localStorage para não perder ao atualizar a página
    let historico = JSON.parse(localStorage.getItem('meuHistorico')) || [];
    historico.push(novoPedido);
    localStorage.setItem('meuHistorico', JSON.stringify(historico));

    // Limpar carrinho e avisar o usuário
    cart = [];
    renderCart();
    cartSidebar.classList.remove('active');
    alert("Pedido realizado com sucesso!");
    
    renderizarHistorico();
};

// Função para mostrar os pedidos no modal
function renderizarHistorico() {
    const ordersList = document.getElementById('orders-list');
    const historico = JSON.parse(localStorage.getItem('meuHistorico')) || [];

    if (historico.length === 0) {
        ordersList.innerHTML = '<p style="text-align:center;">Nenhum pedido realizado.</p>';
        return;
    }

    ordersList.innerHTML = historico.map(pedido => `
        <div class="order-card" style="border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:8px;">
            <div class="order-header">
                <span><strong>Pedido:</strong> #${pedido.id}</span>
                <span><strong>Data:</strong> ${pedido.data}</span>
            </div>
            <div class="order-items">
                ${pedido.itens.map(item => `
                    <div style="font-size:12px;">• ${item.title} - R$ ${item.price.toFixed(2)}</div>
                `).join('')}
            </div>
            <div class="order-total-info">
                <strong>Total: R$ ${pedido.total.toFixed(2).replace('.', ',')}</strong>
            </div>
        </div>
    `).reverse().join(''); // Mostra o mais recente primeiro
}

// Abrir e fechar modal de pedidos
const ordersModal = document.getElementById('orders-modal');
document.getElementById('open-orders').onclick = () => {
    ordersModal.style.display = 'flex';
    renderizarHistorico();
};
document.getElementById('open-orders-dropdown').onclick = () => {
    ordersModal.style.display = 'flex';
    renderizarHistorico();
};
document.getElementById('close-orders').onclick = () => ordersModal.style.display = 'none';

// Limpar Histórico
document.getElementById('clear-orders-btn').onclick = () => {
    if(confirm("Deseja limpar todo o histórico?")) {
        localStorage.removeItem('meuHistorico');
        renderizarHistorico();
    }
};