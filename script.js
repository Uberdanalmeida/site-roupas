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
// 1. Alterar a função de Adicionar
function addToCart(title, price, img) {
    // Verifica se o item já está no carrinho
    const itemIndex = cart.findIndex(item => item.title === title);

    if (itemIndex > -1) {
        cart[itemIndex].qty += 1; // Se existe, só aumenta a quantidade
    } else {
        cart.push({ title, price: parseFloat(price), img, qty: 1 }); // Se não, adiciona com qty: 1
    }
    
    renderCart();
    cartSidebar.classList.add('active');
}

// 2. Nova função para mudar quantidade via botões
function changeQty(index, delta) {
    if (cart[index].qty + delta > 0) {
        cart[index].qty += delta;
    } else {
        removeFromCart(index); // Se chegar a zero, remove
    }
    renderCart();
}

// Função para remover
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    // Atualiza o contador visual da bolinha no ícone do carrinho
    const totalItens = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCount.innerText = totalItens;
    cartCount.style.display = totalItens > 0 ? 'flex' : 'none';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div style="text-align:center; padding:50px;"><h2>Seu carrinho está vazio</h2></div>';
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }

    document.querySelector('.cart-summary').style.display = 'block';

    // Renderiza os itens multiplicando preço por quantidade
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.img}" alt="${item.title}">
            <div class="item-info">
                <h4>${item.title}</h4>
                <div class="item-details">
                    <p>Ref: #2FU-8279-120</p>
                    <p>Tamanho: 39 | Cor: Padrão</p>
                </div>
                <div class="quantity-selector">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <input type="text" value="${item.qty}" readonly>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-price-area">
                <i class='bx bx-trash' onclick="removeFromCart(${index})" style="cursor:pointer; color:#999;"></i>
                <span class="old-price">R$ ${(item.price * 1.4 * item.qty).toFixed(2).replace('.', ',')}</span>
                <span class="current-price">R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}</span>
            </div>
        </div>
    `).join('');

    // Cálculos dos Totais
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const economia = total * 0.40; // Exemplo de 40% de economia

    document.getElementById('subtotal-val').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('savings-val').innerText = `R$ ${economia.toFixed(2).replace('.', ',')}`;
}

// Função do Menu Lateral
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').style.display = 
        document.getElementById('sidebar').classList.contains('active') ? 'block' : 'none';
}

document.getElementById('checkout-btn').onclick = function() {
    // 1. Verifica se o carrinho está vazio
    if (cart.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }

    // 2. Verifica se o utilizador está logado
    const usuario = localStorage.getItem('usuarioLogado');
    if (!usuario) {
        alert("Por favor, faça login ou registe-se para continuar.");
        loginModal.style.display = 'flex'; // Abre o modal de login automaticamente
        return;
    }

    // 3. Verifica se o CEP/Morada foi preenchido
    const endereco = localStorage.getItem('enderecoTemp');
    if (!endereco) {
        alert("Por favor, consulte o seu CEP para calcular o frete e definir a morada de entrega.");
        
        // Opcional: Faz scroll suave até o campo de CEP para ajudar o utilizador
        document.getElementById('cep-input').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('cep-input').focus();
        return;
    }

    // Se passou em todas as verificações, prossegue para o pagamento
    const totalFormatado = document.getElementById('cart-total').innerText.replace('R$ ', '');
    localStorage.setItem('cartTemp', JSON.stringify(cart));
    localStorage.setItem('totalTemp', totalFormatado);

    // Salva no histórico (opcional, já que o WhatsApp será o canal oficial)
    const novoPedido = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleDateString('pt-BR'),
        itens: [...cart],
        total: cart.reduce((acc, item) => acc + (item.price * item.qty), 0)
    };
    let historico = JSON.parse(localStorage.getItem('meuHistorico')) || [];
    historico.push(novoPedido);
    localStorage.setItem('meuHistorico', JSON.stringify(historico));

    // Redireciona para o checkout
    window.location.href = 'checkout/checkout.html';
};

// Função para mostrar os pedidos no modal
function renderizarHistorico() {
    const ordersList = document.getElementById('orders-list');
    const historico = JSON.parse(localStorage.getItem('meuHistorico')) || [];

    if (historico.length === 0) {
        ordersList.innerHTML = '<p style="text-align:center; padding: 20px;">Nenhum pedido realizado.</p>';
        return;
    }

    ordersList.innerHTML = historico.map(pedido => `
        <div class="order-card" style="border:1px solid #eee; padding:15px; margin-bottom:15px; border-radius:8px; background: #f9f9f9;">
            <div class="order-header" style="display:flex; justify-content:space-between; border-bottom:1px solid #ddd; padding-bottom:5px; margin-bottom:10px;">
                <span><strong>Pedido:</strong> #${pedido.id}</span>
                <span style="color: #666; font-size: 0.9em;">${pedido.data}</span>
            </div>
            <div class="order-items" style="margin-bottom: 10px;">
                ${pedido.itens.map(item => `
                    <div style="font-size:13px; color: #444; margin-bottom: 3px;">
                        • ${item.title} (x${item.qty || 1}) - R$ ${item.price.toFixed(2)}
                    </div>
                `).join('')}
            </div>
            <div class="order-total-info" style="text-align:right; border-top: 1px dashed #ccc; pt-5px; margin-top:5px;">
                <span style="font-size: 1.1em;">Total: <strong>R$ ${pedido.total.toFixed(2).replace('.', ',')}</strong></span>
            </div>
        </div>
    `).reverse().join('');
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

// --- 6. SISTEMA DE BUSCA ---

// Primeiro, definimos os dados dos produtos para a busca
const produtosBusca = [
    { title: "Camiseta", price: 40.00, img: "./imagens/camiseta.jpg" },
    { title: "Sapato", price: 79.90, img: "./imagens/sapato.jpg" },
    { title: "Camiseta Estampada", price: 39.90, img: "./imagens/camiseta.jpg" },
    { title: "Tênis", price: 150.00, img: "./imagens/sapato.jpg" },
    { title: "Chinelo", price: 50.00, img: "./imagens/camiseta.jpg" },
    { title: "Bicicleta", price: 1550.00, img: "./imagens/sapato.jpg" },
    { title: "Calça", price: 59.90, img: "./imagens/camiseta.jpg" },
    { title: "Blusa", price: 80.00, img: "./imagens/sapato.jpg" }
];

const inputPesquisa = document.getElementById('carrinho-pesquisa');
const resultadosContainer = document.getElementById('search-results');

inputPesquisa.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    
    if (termo.length < 1) {
        resultadosContainer.style.display = 'none';
        return;
    }

    const filtrados = produtosBusca.filter(p => 
        p.title.toLowerCase().includes(termo)
    );

    if (filtrados.length > 0) {
        resultadosContainer.style.display = 'block';
        resultadosContainer.innerHTML = filtrados.map(p => `
            <div class="search-item" onclick="selecionarProdutoBusca('${p.title}', ${p.price}, '${p.img}')">
                <img src="${p.img}" alt="${p.title}">
                <div>
                    <div>${p.title}</div>
                    <small>R$ ${p.price.toFixed(2)}</small>
                </div>
            </div>
        `).join('');
    } else {
        resultadosContainer.innerHTML = '<div class="search-item">Nenhum produto encontrado</div>';
    }
});

function selecionarProdutoBusca(title, price, img) {
    openProductModal(title, price, img); 
    inputPesquisa.value = ''; // Limpa o campo de busca
    resultadosContainer.style.display = 'none'; // Esconde a lista de resultados
}

// Fecha os resultados se clicar fora
document.addEventListener('click', (e) => {
    if (!inputPesquisa.contains(e.target) && !resultadosContainer.contains(e.target)) {
        resultadosContainer.style.display = 'none';
    }
});

// --- 7. MODAL DE DETALHES DO PRODUTO ---

const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalAddBtn = document.getElementById('modal-add-cart');

// ADICIONE ESTE BLOCO ABAIXO DAS CONSTANTES DA SEÇÃO 7:

function openProductModal(title, price, img) {
    const productModal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalAddBtn = document.getElementById('modal-add-cart');
    const thumbContainer = document.getElementById('modal-thumbnails');

    // 1. Preenche dados básicos
    modalImg.src = img;
    modalTitle.innerText = title;
    modalPrice.innerText = `R$ ${price.toFixed(2).replace('.', ',')}`;

    // 2. Criar Miniaturas (Simulando 3 ângulos diferentes com a mesma imagem)
    // Em um sistema real, você teria um array de imagens para cada produto
    const imagensGaleria = [img, img, img]; 
    
    thumbContainer.innerHTML = imagensGaleria.map((src, index) => `
        <img src="${src}" 
             class="thumb-item ${index === 0 ? 'active' : ''}" 
             onclick="document.getElementById('modal-img').src = '${src}'; updateThumbActive(this)">
    `).join('');

    // 3. Configura o botão comprar
    modalAddBtn.onclick = () => {
        addToCart(title, price, img);
        closeProductModal();
    };

    productModal.style.display = 'flex';
}

// Função auxiliar para destacar a miniatura selecionada
function updateThumbActive(element) {
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

// Função para fechar o modal
function closeProductModal() {
    productModal.style.display = 'none';
}

// Lógica de Cadastro - Versão Corrigida
document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value; // Certifique-se que o ID no HTML é reg-password
    
    // Pega a lista de todos os usuários já cadastrados
    let listaUsuarios = JSON.parse(localStorage.getItem('listaUsuarios')) || [];

    // Verifica se o e-mail já existe na lista
    if (listaUsuarios.some(u => u.email === email)) {
        alert("Este e-mail já está cadastrado!");
        return;
    }

    // Adiciona o novo usuário à lista
    const novoUsuario = { nome, email, password };
    listaUsuarios.push(novoUsuario);
    
    // Salva a lista atualizada e loga o usuário
    localStorage.setItem('listaUsuarios', JSON.stringify(listaUsuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
    
    alert("Conta criada com sucesso!");
    efetuarLoginInterface(nome);
    registerModal.style.display = 'none';
};

function closeProductModal() {
    productModal.style.display = 'none';
}

// Fechar o modal no botão X
document.getElementById('close-product').onclick = closeProductModal;

// Fechar se clicar fora do conteúdo branco
window.onclick = (event) => {
    if (event.target == productModal) closeProductModal();
    if (event.target == document.getElementById('orders-modal')) {
        document.getElementById('orders-modal').style.display = 'none';
    }
};

// --- 8. SISTEMA DE LOGIN E CADASTRO ---

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginTrigger = document.querySelector('.login-trigger span'); // O texto "Entrar"
const loginIcon = document.querySelector('.login-trigger i');

// Abrir Modais
document.querySelector('.login-link').onclick = () => loginModal.style.display = 'flex';
document.getElementById('go-to-login').onclick = (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
};
// No modal de login, o link "Criar uma agora"
document.querySelector('#login-form .form-footer a').onclick = (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
};

// Fechar Modais
document.getElementById('close-login').onclick = () => loginModal.style.display = 'none';
document.getElementById('close-register').onclick = () => registerModal.style.display = 'none';

// Lógica de Cadastro
document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    
    // Salva o usuário no navegador
    const usuario = { nome, email };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    
    alert(`Conta criada com sucesso! Bem-vindo, ${nome}`);
    efetuarLoginInterface(nome);
    registerModal.style.display = 'none';
};

// Lógica de Login com Validação
document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const emailDigitado = document.getElementById('email').value;
    const senhaDigitada = document.getElementById('password').value;
    
    // Tenta buscar o usuário no banco de dados local (localStorage)
    const usuariosCadastrados = JSON.parse(localStorage.getItem('listaUsuarios')) || [];
    
    // Procura se existe algum usuário com esse e-mail e senha
    const usuarioEncontrado = usuariosCadastrados.find(u => 
        u.email === emailDigitado && u.password === senhaDigitada
    );

    if (usuarioEncontrado) {
        // Se encontrou, salva como logado e atualiza a tela
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
        efetuarLoginInterface(usuarioEncontrado.nome);
        loginModal.style.display = 'none';
        alert(`Bem-vindo de volta, ${usuarioEncontrado.nome}!`);
    } else {
        // Se não encontrou, avisa o usuário
        alert("Erro: E-mail ou senha incorretos. Caso não tenha conta, clique em 'Criar uma agora'.");
    }
};

// Função para mudar o cabeçalho
function efetuarLoginInterface(nome) {
    document.getElementById('btn-logout').style.display = 'block';
    loginTrigger.innerText = `Olá, ${nome.split(' ')[0]}`; // Pega só o primeiro nome
    loginIcon.className = 'bx bxs-user-check'; // Muda o ícone para um de "verificado"
}

// Função para realizar o Logout
function realizarLogout() {
    if (confirm("Deseja realmente sair da sua conta?")) {
        localStorage.removeItem('usuarioLogado');
        alert("Você saiu da conta.");
        location.reload(); // Recarrega para voltar o texto "Entrar"
    }
}

// Configura o botão "Sair" do Dropdown
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.onclick = (e) => {
        e.preventDefault();
        realizarLogout();
    };
}

// Melhoria: Esconder o botão "Sair" se não estiver logado
function atualizarMenuUsuario() {
    const logado = localStorage.getItem('usuarioLogado');
    const itemLogout = document.getElementById('btn-logout');
    
    if (logado) {
        if (itemLogout) itemLogout.style.display = 'block';
    } else {
        if (itemLogout) itemLogout.style.display = 'none';
    }
}

// Chame essa função dentro da sua window.addEventListener('load', ...)
// e também dentro da função efetuarLoginInterface(nome)

// Verificar se já estava logado ao abrir a página
window.addEventListener('load', () => {
    const logado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (logado) {
        efetuarLoginInterface(logado.nome);
    }
});

async function consultarFrete() {
    const cepInput = document.getElementById('cep-input');
    const cep = cepInput.value.replace(/\D/g, '');
    const resultContainer = document.getElementById('shipping-result');
    const btn = document.querySelector('.btn-consultar');

    if (cep.length !== 8) {
        alert("Por favor, digite um CEP válido.");
        return;
    }

    btn.innerText = "Buscando...";
    btn.disabled = true;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert("CEP não encontrado.");
            resetConsulta(btn, resultContainer);
            return;
        }

        // Simulação de delay para experiência do usuário
        setTimeout(() => {
            resultContainer.style.display = 'block';
            
            // Montando o endereço detalhado
            // data.logradouro = Rua/Avenida | data.bairro = Bairro | data.localidade = Cidade
            const enderecoCompleto = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
            localStorage.setItem('enderecoTemp', enderecoCompleto);

            resultContainer.innerHTML = `
                <div class="shipping-info-detail">
                    <p class="location-text"><i class='bx bx-map-pin'></i> ${enderecoCompleto}</p>
                    <div class="shipping-option">
                        <div>
                            <span class="shipping-name">Entrega Padrão</span>
                            <span class="shipping-deadline">Receba em até 4 dias úteis</span>
                        </div>
                        <strong class="free-badge">Grátis</strong>
                    </div>
                </div>
            `;
            
            btn.innerText = "Consultar";
            btn.disabled = false;
            btn.innerHTML = "<i class='bx bx-check'></i> Morada Confirmada";
            btn.style.background = "#28a745"; // Verde de sucesso
            btn.style.color = "white"; 
        }, 600);

    } catch (error) {
        alert("Erro ao conectar com o serviço de frete.");
        resetConsulta(btn, resultContainer);
    }
}

function resetConsulta(btn, container) {
    btn.innerText = "Consultar";
    btn.disabled = false;
    container.style.display = 'none';
}

// --- LÓGICA DE PAGINAÇÃO (MODO REPETIÇÃO) ---

const containerProdutos = document.querySelector('.shop-content');
const botoesPagina = document.querySelectorAll('.page-number');
const btnAnterior = document.querySelector('.btn-nav:first-child');
const btnProxima = document.querySelector('.btn-nav:last-child');

let paginaAtual = 1;

// Função para renderizar os produtos da página
function carregarPagina(numeroPagina) {
    paginaAtual = numeroPagina;
    
    // Limpa a vitrine atual
    containerProdutos.innerHTML = '';

    // Aqui usamos a sua lista 'produtosBusca' que já existe no seu script
    // Vamos mostrar os 8 produtos (ou repetir se a lista for pequena)
    produtosBusca.forEach(p => {
        const productHtml = `
            <div class="product-box">
                <img src="${p.img}" alt="${p.title}" class="product-img" onclick="openProductModal('${p.title}', ${p.price}, '${p.img}')" style="cursor:pointer">
                <h2 class="product-title">${p.title}</h2>
                <span class="price">$${p.price.toFixed(2)}</span>
                <i class='bx bx-shopping-bag add-cart' onclick="addToCart('${p.title}', ${p.price}, '${p.img}')"></i>
            </div>
        `;
        containerProdutos.innerHTML += productHtml;
    });

    // Atualiza a interface visual
    atualizarInterfacePaginacao();
    
    // Rola para o topo da vitrine para parecer que mudou
    document.getElementById('MenuMain').scrollIntoView({ behavior: 'smooth' });
}

function atualizarInterfacePaginacao() {
    // Remove classe ativa de todos e adiciona no atual
    botoesPagina.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.innerText) === paginaAtual) {
            btn.classList.add('active');
        }
    });

    // Gerencia o estado dos botões Anterior/Próxima
    if (paginaAtual === 1) {
        btnAnterior.classList.add('disabled');
    } else {
        btnAnterior.classList.remove('disabled');
    }

    if (paginaAtual === botoesPagina.length) {
        btnProxima.classList.add('disabled');
    } else {
        btnProxima.classList.remove('disabled');
    }
}

// Eventos de clique nos números
botoesPagina.forEach(btn => {
    btn.onclick = () => carregarPagina(parseInt(btn.innerText));
});

// Evento botão Anterior
btnAnterior.onclick = (e) => {
    e.preventDefault();
    if (paginaAtual > 1) carregarPagina(paginaAtual - 1);
};

// Evento botão Próxima
btnProxima.onclick = (e) => {
    e.preventDefault();
    if (paginaAtual < botoesPagina.length) carregarPagina(paginaAtual + 1);
};