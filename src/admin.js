import './style.css';
import { storage } from './storage.js';

// Estado Local del Admin
let products = [];
let isEditing = false;

// Referencias al DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const productForm = document.getElementById('product-form');
const productModal = document.getElementById('product-modal');
const tableBody = document.getElementById('admin-products-list');

// 1. Lógica de Autenticación (Login Simple)
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  // Credenciales "Hardcoded" para demostración
  if (user === 'admin' && pass === '1234') {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    loadProducts(); // Cargar datos al entrar
  } else {
    alert('Usuario o contraseña incorrectos ❌');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  window.location.reload();
});

document.getElementById('btn-view-site').addEventListener('click', () => {
  window.open('/', '_blank');
});

// 2. Gestión de Productos (CRUD)
const loadProducts = () => {
  products = storage.getProducts();
  renderTable();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

const renderTable = () => {
  tableBody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" alt="img"></td>
      <td>
        <div>${p.name}</div>
        <small style="color:gray">${p.category}</small>
      </td>
      <td>${formatCurrency(p.price)}</td>
      <td>${p.stock} un.</td>
      <td>
        <span class="${p.active ? 'badge-active' : 'badge-inactive'}">
          ${p.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <button class="btn-edit" data-id="${p.id}" style="margin-right:0.5rem; cursor:pointer;">✏️</button>
        <button class="btn-delete" data-id="${p.id}" style="color:red; cursor:pointer;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Re-asignar eventos
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => openModal(parseInt(e.target.dataset.id)));
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deleteProduct(parseInt(e.target.dataset.id)));
  });
};

// 3. Crear / Editar
const openModal = (id = null) => {
  isEditing = !!id; // Si hay ID es edición, sino es nuevo
  document.getElementById('modal-title').innerText = isEditing ? 'Editar Producto' : 'Nuevo Producto';
  document.getElementById('product-modal').classList.add('open');

  if (isEditing) {
    const p = products.find(x => x.id === id);
    document.getElementById('edit-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock || 0;
    document.getElementById('p-image').value = p.image;
    document.getElementById('p-active').checked = p.active;
  } else {
    productForm.reset();
    document.getElementById('p-active').checked = true;
  }
};

const closeModal = () => {
  document.getElementById('product-modal').classList.remove('open');
};

document.getElementById('btn-create').addEventListener('click', () => openModal());
document.getElementById('btn-cancel').addEventListener('click', closeModal);

productForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const productData = {
    id: isEditing ? parseInt(document.getElementById('edit-id').value) : Date.now(),
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    price: parseInt(document.getElementById('p-price').value),
    stock: parseInt(document.getElementById('p-stock').value),
    image: document.getElementById('p-image').value,
    active: document.getElementById('p-active').checked
  };

  if (isEditing) {
    const index = products.findIndex(p => p.id === productData.id);
    products[index] = productData;
  } else {
    products.push(productData);
  }

  storage.saveProducts(products); // IMPORTANTE: Guardar en LocalStorage
  loadProducts();
  closeModal();
  alert('¡Producto guardado correctamente! ✅');
});

// 4. Eliminar
const deleteProduct = (id) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    products = products.filter(p => p.id !== id);
    storage.saveProducts(products);
    loadProducts();
  }
};
