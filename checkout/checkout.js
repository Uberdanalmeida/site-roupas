// Recupera dados do LocalStorage
const cart = JSON.parse(localStorage.getItem('cartTemp')) || [];
const total = localStorage.getItem('totalTemp') || "0,00";

// Preenche o resumo ao carregar a página
document.getElementById('valor-final').innerText = `R$ ${total}`;
// Exemplo de como referenciar a pasta de imagens de dentro da pasta checkout
document.getElementById('lista-resumo').innerHTML = cart.map(i => `
    <div style="display:flex; align-items:center; gap:10px;">
        <img src="../${i.img.replace('./', '')}" style="width:50px"> 
        <span>${i.qty}x ${i.title}</span>
    </div>
`).join('');

function selectMethod(method) {
    // Remove ativo de todos e adiciona no selecionado
    document.querySelectorAll('.method-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    // Esconde todos os formulários e mostra o escolhido
    document.querySelectorAll('.payment-form').forEach(f => f.classList.add('hidden'));
    document.getElementById('form-' + method).classList.remove('hidden');
}

function concluir() {
    const seuNumero = "5511999999999"; // Substitua pelo seu número real
    const metodoAtivo = document.querySelector('.method-card.active').innerText.trim();
    
    const endereco = localStorage.getItem('enderecoTemp') || "Retirada na loja / Não informado";
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const nomeCliente = usuario ? usuario.nome : "Cliente";

    let mensagem = `*📦 NOVO PEDIDO - ${nomeCliente.toUpperCase()}*%0A`;
    mensagem += `----------------------------%0A`;
    mensagem += `*📍 Endereço:* ${endereco}%0A`;
    mensagem += `*💳 Pagamento:* ${metodoAtivo}%0A`;
    mensagem += `*💰 Total:* R$ ${total}%0A%0A`;

    mensagem += `*Produtos:*%0A`;
    cart.forEach(item => {
        mensagem += `- ${item.qty}x ${item.title}%0A`;
    });

    mensagem += `%0A----------------------------%0A`;
    mensagem += `*Link para o comprovante:* (Anexe abaixo)`;

    const urlWhatsApp = `https://wa.me/${seuNumero}?text=${mensagem}`;

    // Limpeza
    localStorage.removeItem('cartTemp');
    localStorage.removeItem('enderecoTemp');
    
    window.open(urlWhatsApp, '_blank');
    window.location.href = '../index.html'; // Volta para a raiz
}