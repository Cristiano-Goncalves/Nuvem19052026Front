const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductPrice = document.querySelector('#update-price');
const updateProductDescription = document.querySelector('#update-description');
const searchIdInput = document.querySelector('#search-id');
const btnSearch = document.querySelector('#btn-search');
const searchResultDiv = document.querySelector('#search-result');
const deleteIdInput = document.querySelector('#delete-id');
const btnDelete = document.querySelector('#btn-delete');
const deleteResultDiv = document.querySelector('#delete-result');

const BASE_URL = 'http://13.58.211.28:3000/products';

// ==========================================
// 1. LISTAR PRODUTOS (GET)
// ==========================================
async function fetchProducts() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos');
    }
    const products = await response.json();
    productList.innerHTML = '';

    products.forEach(product => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>ID:</strong> ${product.id}
        |
        <strong>${product.name}</strong>
        -
        R$ ${product.price}
        |
        <em>${product.description || 'Sem descrição'}</em>
      `;
      productList.appendChild(li);
    });
  } catch (error) {
    console.error('Erro na listagem:', error);
  }
}

// ==========================================
// 2. ADICIONAR PRODUTO (POST)
// ==========================================
if (addProductForm) {
  addProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = addProductForm.elements['name'].value;
    const price = addProductForm.elements['price'].value;
    const description = addProductForm.elements['description'].value;

    const resultado = await addProduct(name, price, description);
    console.log("Resposta do servidor (Add):", resultado);
    
    addProductForm.reset(); 
    voltarMenu();           
    await fetchProducts();
  });
}

async function addProduct(name, price, description) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description })
    });
    return await response.text();
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
  }
}

// ==========================================
// 3. ATUALIZAR PRODUTO (PUT)
// ==========================================
if (updateProductForm) {
  updateProductForm.addEventListener('submit', async event => {
    event.preventDefault();
    const id = updateProductId.value;
    const name = updateProductName.value;
    const price = updateProductPrice.value;
    const description = updateProductDescription.value;

    if (!id) {
      alert('Selecione um produto da lista para atualizar.');
      return;
    }

    const resultado = await updateProduct(id, name, price, description);
    console.log("Resposta do servidor (Update):", resultado);

    updateProductForm.reset();
    voltarMenu();
    await fetchProducts();
  });
}

async function updateProduct(id, name, price, description) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description })
    });
    return await response.text();
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
  }
}

// ==========================================
// 4. PESQUISAR POR ID (GET) - AJUSTADO E BLINDADO
// ==========================================
if (btnSearch) {
  btnSearch.addEventListener('click', async (e) => {
    e.preventDefault(); // Evita qualquer recarregamento ou bug na árvore do DOM
    const id = searchIdInput.value.trim();
    
    if (!id) {
      searchResultDiv.innerHTML = '<p>Informe um ID para pesquisa.</p>';
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      
      if (response.status === 404) {
        searchResultDiv.innerHTML = `<p>Produto ${id} não encontrado.</p>`;
        return;
      }

      const product = await response.json();
      
      // O segredo está aqui: Se a API devolver uma lista [], pegamos a posição [0]. Se vier objeto direto, usamos ele.
      const item = Array.isArray(product) ? product[0] : product;

      if (!item) {
        searchResultDiv.innerHTML = `<p>Produto ${id} não encontrado.</p>`;
        return;
      }

      // Reescrevemos a estrutura limpando os termos antigos do HTML estático
      searchResultDiv.innerHTML = `
        <div style="margin-top: 15px; padding: 10px; border-left: 4px solid #007bff; background: #f8f9fa;">
          <p><strong>ID:</strong> ${item.id}</p>
          <p><strong>Nome:</strong> ${item.name}</p>
          <p><strong>Preço:</strong> R$ ${item.price}</p>
          <p><strong>Descrição:</strong> ${item.description || 'Sem descrição'}</p>
        </div>
      `;

    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      searchResultDiv.innerHTML = '<p>Erro ao pesquisar produto. Verifique a conexão com o servidor.</p>';
    }
  });
}

// ==========================================
// 5. EXCLUIR PRODUTO (DELETE)
// ==========================================
async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Erro ao excluir produto');
  }
  return await response.text();
}

// ==========================================
// NAVEGAÇÃO DE TELAS (SINGLE PAGE APPLICATION)
// ==========================================
function ocultarTodasAsTelas() {
  document.querySelectorAll('.tela').forEach(secao => {
    secao.style.display = 'none';
  });
  const menu = document.getElementById('menu-principal');
  if (menu) menu.style.display = 'none';
}

function mostrarTela(id) {
  ocultarTodasAsTelas();
  const tela = document.getElementById(id);
  if (tela) tela.style.display = 'block';
}

function voltarMenu() {
  ocultarTodasAsTelas();
  const menu = document.getElementById('menu-principal');
  if (menu) menu.style.display = 'block';
}

async function abrirListagem() {
  await fetchProducts();
  mostrarTela('list-section');
}

async function abrirAtualizacao() {
  await carregarProdutosAtualizacao();
  mostrarTela('update-section');
}

async function abrirExclusao() {
  await carregarProdutosExclusao();
  mostrarTela('delete-section');
}

// ==========================================
// INICIALIZAÇÃO DA PÁGINA
// ==========================================
window.addEventListener('load', () => {
  voltarMenu();
  fetchProducts();
});

const themeButton = document.getElementById('theme-toggle');
if (themeButton) {
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      themeButton.innerHTML = '☀️ Modo Claro';
    } else {
      themeButton.innerHTML = '🌙 Modo Escuro';
    }
  });
}

// ==========================================
// CARREGADORES AUXILIARES DE INTERFACE
// ==========================================
async function carregarProdutosAtualizacao() {
  try {
    const response = await fetch(BASE_URL);
    const products = await response.json();
    const lista = document.getElementById('update-products-list');
    if (!lista) return;
    lista.innerHTML = '';

    products.forEach(product => {
      const li = document.createElement('li');
      const info = document.createElement('span');
      info.innerHTML = `<strong>ID:</strong> ${product.id} | <strong>${product.name}</strong> | R$ ${product.price}`;

      const botao = document.createElement('button');
      botao.textContent = 'Selecionar';
      botao.addEventListener('click', () => {
        updateProductId.value = product.id;
        updateProductName.value = product.name;
        updateProductPrice.value = product.price;
        updateProductDescription.value = product.description || '';

        const formDoc = document.getElementById('update-product-form');
        if (formDoc) {
          window.scrollTo({
            top: formDoc.offsetTop - 20,
            behavior: 'smooth'
          });
        }
      });

      li.appendChild(info);
      li.appendChild(botao);
      lista.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
}

async function carregarProdutosExclusao() {
  try {
    const response = await fetch(BASE_URL);
    const products = await response.json();
    const lista = document.getElementById('delete-products-list');
    if (!lista) return;
    lista.innerHTML = '';

    products.forEach(product => {
      const li = document.createElement('li');
      const info = document.createElement('span');
      info.innerHTML = `<strong>ID:</strong> ${product.id} | <strong>${product.name}</strong>`;

      const botao = document.createElement('button');
      botao.textContent = 'Excluir';
      botao.addEventListener('click', async () => {
        const confirmar = confirm(`Deseja excluir o produto "${product.name}"?`);
        if (!confirmar) return;

        try {
          const resExclusao = await deleteProduct(product.id);
          console.log("Resposta do servidor (Delete):", resExclusao);
          if (deleteResultDiv) deleteResultDiv.innerHTML = `<p>Produto "${product.name}" excluído com sucesso.</p>`;
          await carregarProdutosExclusao();
          await fetchProducts();
        } catch (error) {
          console.error(error);
          if (deleteResultDiv) deleteResultDiv.innerHTML = '<p>Erro ao excluir produto.</p>';
        }
      });

      li.appendChild(info);
      li.appendChild(botao);
      lista.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
}
