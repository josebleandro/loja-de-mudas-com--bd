// CONFIGURAÇÃO DO BANCO DE DADOS (Substitua com os seus dados do Supabase)
const SUPABASE_URL = "https://zxczcpbpvttpteuuixdi.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_secret_VMUMThnQw3Kc9q-6znn52g_mYTY43Xo";

// Configuração dos cabeçalhos para conversar com a API do Supabase
const headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json"
};

// Variáveis Globais do Carrinho
let carrinho = [];
const contadorHTML = document.getElementById('contador-carrinho');
const listaHTML = document.getElementById('lista-carrinho');
const valorTotalHTML = document.getElementById('valor-total');
const botaoLimpar = document.getElementById('btn-limpar');
const botaoFinalizar = document.getElementById('btn-finalizar');

// --- 1. FUNÇÃO PARA BUSCAR AS MUDAS NO BANCO DE DADOS (SELECT) ---
async function carregarMudasDoBanco() {
    const containerProdutos = document.getElementById('produtos-dinamicos');
    
    try {
        // Faz uma requisição GET para a tabela 'plantas' do Supabase
        const resposta = await fetch(`${SUPABASE_URL}/rest/v1/plantas?select=*`, {
            method: "GET",
            headers: headers
        });
        
        const plantas = await resposta.json();
        
        // Limpa o texto de "Carregando..."
        containerProdutos.innerHTML = '';
        
        // Desenha cada planta vinda do banco na tela
        plantas.forEach(planta => {
            const card = document.createElement('div');
            card.classList.add('card-planta');
            
            const precoFormatadoVisual = planta.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            card.innerHTML = `
                <div class="foto-placeholder">${planta.emoji}</div>
                <h3>Muda de ${planta.nome}</h3>
                <p class="preco">${precoFormatadoVisual}</p>
                <button class="btn-comprar" data-planta="${planta.nome}" data-preco="${planta.preco}">Adicionar ao Carrinho</button>
            `;
            
            containerProdutos.appendChild(card);
        });
        
        // Como os botões foram criados agora pelo JS, precisamos reatribuir o clique deles
        configurarBotoesCompra();
        
    } catch (erro) {
        console.error("Erro ao conectar com o banco de dados:", erro);
        containerProdutos.innerHTML = '<p>Erro ao carregar as mudas. Tente novamente mais tarde.</p>';
    }
}

// --- 2. FUNÇÕES DO CARRINHO DE COMPRAS ---
function configurarBotoesCompra() {
    const botoesComprar = document.querySelectorAll('.btn-comprar');
    botoesComprar.forEach(botao => {
        botao.addEventListener('click', function() {
            const nomePlanta = this.getAttribute('data-planta');
            const precoPlanta = parseFloat(this.getAttribute('data-preco'));
            carrinho.push({ nome: nomePlanta, preco: precoPlanta });
            atualizarInterfaceCarrinho();
        });
    });
}

function atualizarInterfaceCarrinho() {
    contadorHTML.textContent = carrinho.length;
    listaHTML.innerHTML = '';

    if (carrinho.length === 0) {
        listaHTML.classList.add('lista-vazia');
        listaHTML.innerHTML = '<li id="item-vazio">Nenhuma muda adicionada ainda.</li>';
        valorTotalHTML.textContent = 'R\$ 0,00';
        return;
    }

    listaHTML.classList.remove('lista-vazia');
    let somaTotal = 0;
    
    carrinho.forEach((item, index) => {
        somaTotal += item.preco;
        const li = document.createElement('li');
        const precoFormatado = item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        li.innerHTML = `
            <div>
                <span>🌱 Muda de ${item.nome}</span>
                <button class="btn-remover-item" onclick="removerItem(${index})">❌</button>
            </div>
            <strong>${precoFormatado}</strong>
        `;
        listaHTML.appendChild(li);
    });

    valorTotalHTML.textContent = somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarInterfaceCarrinho();
}

// --- 3. EVENTOS DO SISTEMA ---
botaoLimpar.addEventListener('click', function() {
    carrinho = [];
    atualizarInterfaceCarrinho();
});

botaoFinalizar.addEventListener('click', function() {
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    const numeroTelefone = "5511999999999"; 
    let textoMensagem = "Olá! Gostaria de fazer o pedido das seguintes mudas:\n\n";
    carrinho.forEach(item => {
        textoMensagem += `- ${item.nome} (${item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})\n`;
    });
    textoMensagem += `\n*Total do Pedido:* ${valorTotalHTML.textContent}`;
    
    const urlWhatsApp = `https://whatsapp.com{numeroTelefone}&text=${encodeURIComponent(textoMensagem)}`;
    window.open(urlWhatsApp, '_blank');
});

// --- EXECUÇÃO INICIAL ---
// Quando a página abre, roda a função para buscar os dados no banco
carregarMudasDoBanco();
