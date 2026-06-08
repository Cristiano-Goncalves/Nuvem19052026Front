const productList = document.querySelector('#products');
const addProductForm = document.querySelector('#add-product-form');

// Seletores do formulário de Update
const updateProductForm = document.querySelector('#update-product-form');
const updateProductId = document.querySelector('#update-id');
const updateProductName = document.querySelector('#update-name');
const updateProductPrice = document.querySelector('#update-price');
const updateProductDescription = document.querySelector('#update-description'); // Incluído

// Seletores da Consulta por ID
const searchIdInput = document.querySelector('#search-id');
const btnSearch = document.querySelector('#btn-search');
const searchResultDiv = document.querySelector('#search-result');

const BASE_URL = 'http://13.58.211.28:3000/products';

// Function to fetch all products from the server
async function fetchProducts() {
  const response = await fetch(BASE_URL);
  const products = await response.json();

  // Clear product list
  productList.innerHTML = '';

  // Add each product to the list
  products.forEach(product => {
    const li = document.createElement('li');
    // Exibe também a descrição na listagem se ela existir
    li.innerHTML = `<strong>ID:</strong> ${product.id} | <strong>${product.name}</strong> - $${product.price} | <em>${product.description || 'No description'}</em> `;

    // Add delete button for each product
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'Delete';
    deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', async () => {
      await deleteProduct(product.id);
      await fetchProducts();
    });
    li.appendChild(deleteButton);

    // Add update button for each product
    const updateButton = document.createElement('button');
    updateButton.innerHTML = 'Update';
    updateButton.style.marginLeft = '5px';
    updateButton.addEventListener('click', () => {
      // Preenche o formulário de update com os dados do produto clicado
      updateProductId.value = product.id;
      updateProductName.value = product.name;
      updateProductPrice.value = product.price;
      updateProductDescription.value = product.description || ''; // Preenche a descrição no update
    });
    li.appendChild(updateButton);

    productList.appendChild(li);
  });
}

// Event listener for Add Product form submit button
addProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const name = addProductForm.elements['name'].value;
  const price = addProductForm.elements['price'].value;
  const description = addProductForm.elements['description'].value; // Campo descrição incluído (1,0 ponto)
  
  await addProduct(name, price, description);
  addProductForm.reset();
  await fetchProducts();
});

// Function to add a new product
async function addProduct(name, price, description) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, price, description }) // Enviando descrição para o banco
  });
  return response.json();
}

// IMPLEMENTAR O BOTÃO UPDATE NO BANCO DE DADOS (1,0 ponto)
updateProductForm.addEventListener('submit', async event => {
  event.preventDefault();
  const id = updateProductId.value;
  const name = updateProductName.value;
  const price = updateProductPrice.value;
  const description = updateProductDescription.value;

  if (!id) {
    alert('Please select a product from the list to update first.');
    return;
  }

  await updateProduct(id, name, price, description);
  updateProductForm.reset();
  await fetchProducts();
});

// Função que faz a requisição PUT para o banco de dados
async function updateProduct(id, name, price, description) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT', // ou 'PATCH', dependendo de como seu backend foi estruturado
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, price, description })
  });
  return response.json();
}

// Function to delete a product
async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/` + id, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}

// IMPLEMENTAR A TELA DE CONSULTA PELO ID (0,5 pontos)
btnSearch.addEventListener('click', async () => {
  const id = searchIdInput.value;
  
  if (!id) {
    searchResultDiv.innerHTML = '<p style="color: red;">Please enter an ID to search.</p>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/${id}`);
    
    if (response.status === 404) {
      searchResultDiv.innerHTML = `<p style="color: red;">Product with ID ${id} not found.</p>`;
      return;
    }

    const product = await response.json();
    searchResultDiv.innerHTML = `
      <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
        <h3>Product Found:</h3>
        <p><strong>ID:</strong> ${product.id}</p>
        <p><strong>Name:</strong> ${product.name}</p>
        <p><strong>Price:</strong> $${product.price}</p>
        <p><strong>Description:</strong> ${product.description || 'No description'}</p>
      </div>
    `;
  } catch (error) {
    console.error(error);
    searchResultDiv.innerHTML = '<p style="color: red;">Error searching for product.</p>';
  }
});

// Fetch all products on page load
fetchProducts();
