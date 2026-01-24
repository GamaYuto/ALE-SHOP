import './style.css';
import { storage } from './storage.js';
import { authService } from './auth.js';

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

// 1. Gestión de Autenticación Real con Firebase
authService.subscribeToAuthChanges((user) => {
  if (user) {
    // Usuario autenticado
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    loadProducts();
  } else {
    // Usuario no autenticado
    loginScreen.style.display = 'block';
    dashboardScreen.style.display = 'none';
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value; // Usaremos email en Firebase
  const pass = document.getElementById('password').value;

  try {
    await authService.login(email, pass);
    alert('¡Bienvenido! 👋');
  } catch (error) {
    let msg = 'Error al ingresar ❌';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'Correo o contraseña incorrectos. Asegúrate de haber creado el usuario en la consola de Firebase.';
    }
    alert(msg);
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  authService.logout();
});

document.getElementById('btn-view-site').addEventListener('click', () => {
  window.open('/', '_blank');
});

// 2. Gestión de Productos (CRUD)
const loadProducts = async () => {
  products = await storage.getProducts();
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
  if (products.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">No hay productos. Agrega el primero.</td></tr>';
    return;
  }

  tableBody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" alt="img" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
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
        <button class="btn-edit" data-id="${p.id}" style="margin-right:0.5rem; cursor:pointer; background:none; border:none;">✏️</button>
        <button class="btn-delete" data-id="${p.id}" style="color:red; cursor:pointer; background:none; border:none;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Re-asignar eventos
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-edit').dataset.id;
      openModal(id);
    });
  });
  
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-delete').dataset.id;
      deleteProduct(id);
    });
  });
};

// 3. Crear / Editar
const openModal = (id = null) => {
  isEditing = !!id;
  document.getElementById('modal-title').innerText = isEditing ? 'Editar Producto' : 'Nuevo Producto';
  productModal.classList.add('open');

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
    document.getElementById('edit-id').value = '';
    document.getElementById('p-active').checked = true;
  }
};

const closeModal = () => {
  productModal.classList.remove('open');
};

document.getElementById('btn-create').addEventListener('click', () => openModal());
document.getElementById('btn-cancel').addEventListener('click', closeModal);

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productData = {
    name: document.getElementById('p-name').value,
    category: document.getElementById('p-category').value,
    price: parseInt(document.getElementById('p-price').value),
    stock: parseInt(document.getElementById('p-stock').value),
    image: document.getElementById('p-image').value,
    active: document.getElementById('p-active').checked
  };

  try {
    if (isEditing) {
      const id = document.getElementById('edit-id').value;
      await storage.updateProduct(id, productData);
    } else {
      await storage.addProduct(productData);
    }

    await loadProducts();
    closeModal();
    alert('¡Producto guardado correctamente! ✅');
  } catch (error) {
    alert('Error al guardar el producto ❌');
  }
});

// 4. Eliminar
const deleteProduct = async (id) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      await storage.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      alert('Error al eliminar el producto ❌');
    }
  }
};
