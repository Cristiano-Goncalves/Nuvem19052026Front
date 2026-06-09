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

      const updateButton = document.createElement('button');
      updateButton.innerHTML = 'Atualizar';
      updateButton.addEventListener('click', () => {
        abrirAtualizacao();
        updateProductId.value = product.id;
        updateProductName.value = product.name;
        updateProductPrice.value = product.price;
        updateProductDescription.value = product.description || '';
      });

      li.appendChild(updateButton);
      productList.appendChild(li);
    });
  } catch (error) {
    console.error('Erro na listagem:', error);
  }
}

// ==========================================
// 2. ADICIONAR PRODUTO (POST) - Requisito 1
// ==========================================
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

async function addProduct(name, price, description) {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description })
    });
    return await response.text(); // Blindado contra texto puro
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
  }
}

// ==========================================
// 3. ATUALIZAR PRODUTO (PUT) - Requisito 2
// ==========================================
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

async function updateProduct(id, name, price, description) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, description })
    });
    return await response.text(); // Blindado contra texto puro ("updated!!")
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
  }
}

// ==========================================
// 4. PESQUISAR POR ID (GET) - Requisito 3
// ==========================================
if (btnSearch) {
  btnSearch.addEventListener('click', async () => {
    const id = searchIdInput.value;
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
      searchResultDiv.innerHTML = `
        <h3>Produto Encontrado</h3>
        <p><strong>ID:</strong> ${product.id}</p>
        <p><strong>Nome:</strong> ${product.name}</p>
        <p><strong>Preço:</strong> R$ ${product.price}</p>
        <p><strong>Descrição:</strong> ${product.description || 'Sem descrição'}</p>
      `;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      searchResultDiv.innerHTML = '<p>Erro ao pesquisar produto. Verifique se o ID existe.</p>';
    }
  });
}

// ==========================================
// 5. EXCLUIR PRODUTO (DELETE)
// ==========================================
async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) {
    throw new Error('Erro ao excluir produto');
  }
  return await response.text(); // Blindado caso o backend retorne texto puro na exclusão
}

// ==========================================
// NAVEGAÇÃO DE TELAS (SINGLE PAGE APPLICATION)
// ==========================================
function ocultarTodasAsTelas() {
  document.querySelectorAll('.tela').forEach(secao => {
    secao.style.display = 'none';
  });
  document.getElementById('menu-principal').style.display = 'none';
}

function mostrarTela(id) {
  ocultarTodasAsTelas();
  document.getElementById(id).style.display = 'block';
}

function voltarMenu() {
  ocultarTodasAsTelas();
  document.getElementById('menu-principal').style.display = 'block';
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

        window.scrollTo({
          top: document.getElementById('update-product-form').offsetTop - 20,
          behavior: 'smooth'
        });
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
          deleteResultDiv.innerHTML = `<p>Produto "${product.name}" excluído com sucesso.</p>`;
          await carregarProdutosExclusao();
          await fetchProducts();
        } catch (error) {
          console.error(error);
          deleteResultDiv.innerHTML = '<p>Erro ao excluir produto.</p>';
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
