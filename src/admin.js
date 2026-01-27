import './style.css';
import { storage } from './storage.js';
import { authService } from './auth.js';
import { categoriesService } from './categories.js';
import { ordersService } from './orders.js';

// Estado Local del Admin
let products = [];
let categories = [];
let orders = [];
let isEditing = false;
let isEditingCategory = false;
let currentStatusFilter = 'all';

// Referencias al DOM
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const productForm = document.getElementById('product-form');
const productModal = document.getElementById('product-modal');
const categoryForm = document.getElementById('category-form');
const categoryModal = document.getElementById('category-modal');
const tableBody = document.getElementById('admin-products-list');
const categoriesTableBody = document.getElementById('admin-categories-list');

// Nuevas referencias para imágenes
const inputFile = document.getElementById('p-file');
const inputImageUrl = document.getElementById('p-image');
const imagePreview = document.getElementById('image-preview');
const uploadStatus = document.getElementById('upload-status');
const ordersTableBody = document.getElementById('admin-orders-list');

// 1. Gestión de Autenticación Real con Firebase
authService.subscribeToAuthChanges((user) => {
  if (user) {
    // Usuario autenticado
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    loadData();
  } else {
    // Usuario no autenticado
    loginScreen.style.display = 'block';
    dashboardScreen.style.display = 'none';
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  try {
    await authService.login(email, pass);
    showNotification('Bienvenido', 'Has iniciado sesión correctamente. 👋', '🔐');
  } catch (error) {
    let msg = 'Error al ingresar ❌';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      msg = 'Correo o contraseña incorrectos. Asegúrate de haber creado el usuario en la consola de Firebase.';
    }
    showNotification('Error de Acceso', msg, '❌');
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  authService.logout();
});

document.getElementById('btn-view-site').addEventListener('click', () => {
  window.open('/', '_blank');
});

// 2. Gestión de Pestañas
const tabOrders = document.getElementById('tab-orders');
const tabProducts = document.getElementById('tab-products');
const tabCategories = document.getElementById('tab-categories');
const sectionOrders = document.getElementById('section-orders');
const sectionProducts = document.getElementById('section-products');
const sectionCategories = document.getElementById('section-categories');

const switchTab = (activeTab, activeSection) => {
  // Ocultar todas las secciones
  sectionOrders.style.display = 'none';
  sectionProducts.style.display = 'none';
  sectionCategories.style.display = 'none';
  
  // Desactivar todas las pestañas
  [tabOrders, tabProducts, tabCategories].forEach(tab => {
    tab.classList.remove('active');
    tab.style.borderBottom = '3px solid transparent';
    tab.style.color = 'var(--gray)';
  });
  
  // Activar la pestaña y sección seleccionada
  activeTab.classList.add('active');
  activeTab.style.borderBottom = '3px solid var(--primary)';
  activeTab.style.color = 'var(--primary)';
  activeSection.style.display = 'block';
};

tabOrders.addEventListener('click', () => switchTab(tabOrders, sectionOrders));
tabProducts.addEventListener('click', () => switchTab(tabProducts, sectionProducts));
tabCategories.addEventListener('click', () => switchTab(tabCategories, sectionCategories));

// --- Lógica de Compresión y Base64 ---
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Máximo 800px de ancho para ahorrar espacio
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Comprimir al 70% de calidad en formato JPEG (muy ligero)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
    };
  });
};

inputFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    uploadStatus.style.display = 'block';
    const base64 = await compressImage(file);
    
    inputImageUrl.value = base64;
    imagePreview.style.display = 'block';
    imagePreview.querySelector('img').src = base64;
    
    uploadStatus.style.display = 'none';
  } catch (error) {
    console.error("Error al procesar imagen:", error);
    showNotification('Error', 'Error al procesar la imagen ❌', '⚠️');
    uploadStatus.style.display = 'none';
  }
});
// -----------------------------------

// 3. Cargar datos
const loadData = async () => {
  await loadOrders();
  await loadCategories();
  await loadProducts();
};

const loadOrders = async () => {
  orders = await ordersService.getOrders();
  renderOrdersTable();
};

const loadProducts = async () => {
  products = await storage.getProducts();
  renderTable();
};

const loadCategories = async () => {
  categories = await categoriesService.getCategories();
  renderCategoriesTable();
  updateCategorySelect();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

// 4. Renderizar tabla de productos
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

// 5. Renderizar tabla de categorías
const renderCategoriesTable = () => {
  if (categories.length === 0) {
    categoriesTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem;">No hay categorías. Agrega la primera.</td></tr>';
    return;
  }

  categoriesTableBody.innerHTML = categories.map(cat => {
    const productCount = products.filter(p => p.category === cat.name).length;
    return `
      <tr>
        <td style="font-size: 2rem;">${cat.icon || '📦'}</td>
        <td><strong>${cat.name}</strong></td>
        <td>${productCount} producto${productCount !== 1 ? 's' : ''}</td>
        <td>
          <button class="btn-edit-cat" data-id="${cat.id}" style="margin-right:0.5rem; cursor:pointer; background:none; border:none;">✏️</button>
          <button class="btn-delete-cat" data-id="${cat.id}" style="color:red; cursor:pointer; background:none; border:none;">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');

  document.querySelectorAll('.btn-edit-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-edit-cat').dataset.id;
      openCategoryModal(id);
    });
  });
  
  document.querySelectorAll('.btn-delete-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.closest('.btn-delete-cat').dataset.id;
      deleteCategory(id);
    });
  });
};

// 6. Actualizar select de categorías en formulario de productos
const updateCategorySelect = () => {
  const select = document.getElementById('p-category');
  select.innerHTML = categories.map(cat => `
    <option value="${cat.name}">${cat.icon || '📦'} ${cat.name}</option>
  `).join('');
};

// 7. CRUD de Productos
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
    
    // Mostrar previsualización
    if (p.image) {
      imagePreview.style.display = 'block';
      imagePreview.querySelector('img').src = p.image;
    } else {
      imagePreview.style.display = 'none';
    }
  } else {
    productForm.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('p-active').checked = true;
    imagePreview.style.display = 'none';
  }
  if (uploadStatus) uploadStatus.style.display = 'none';
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
    showNotification('Éxito', '¡Producto guardado correctamente! ✅', '💾');
  } catch (error) {
    showNotification('Error', 'Error al guardar el producto ❌', '⚠️');
  }
});

const deleteProduct = async (id) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      await storage.deleteProduct(id);
      await loadProducts();
    } catch (error) {
      showNotification('Error', 'Error al eliminar el producto ❌', '⚠️');
    }
  }
};

// 8. CRUD de Categorías

// Lista de emojis sugeridos para categorías
const categoryEmojis = [
  '👗', '👔', '👕', '👖', '👘', '👚', '🧥', '🥼',
  '💄', '💅', '💋', '🧴', '🧼', '🧽', '🪒', '💆',
  '👜', '👝', '🎒', '👛', '💼', '🧳', '👓', '🕶️',
  '⌚', '💍', '💎', '📿', '👑', '🎩', '🧢', '👒',
  '👠', '👡', '👢', '👞', '👟', '🥾', '🥿', '🩴',
  '🎀', '🎁', '🌸', '🌺', '🌹', '🌷', '🌼', '🌻',
  '✨', '💫', '⭐', '🌟', '💖', '💝', '🎨', '🖌️'
];

// Renderizar selector de emojis
const renderEmojiPicker = () => {
  const emojiPicker = document.getElementById('emoji-picker');
  emojiPicker.innerHTML = categoryEmojis.map(emoji => `
    <button type="button" class="emoji-btn" data-emoji="${emoji}" style="
      font-size: 1.5rem;
      padding: 0.5rem;
      border: 2px solid transparent;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    ">${emoji}</button>
  `).join('');

  // Agregar eventos a los botones de emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const emoji = e.target.dataset.emoji;
      document.getElementById('cat-icon').value = emoji;
      
      // Resaltar el emoji seleccionado
      document.querySelectorAll('.emoji-btn').forEach(b => {
        b.style.borderColor = 'transparent';
        b.style.background = 'white';
      });
      e.target.style.borderColor = 'var(--primary)';
      e.target.style.background = 'rgba(79, 70, 229, 0.1)';
    });

    // Efecto hover
    btn.addEventListener('mouseenter', (e) => {
      if (e.target.style.borderColor !== 'var(--primary)') {
        e.target.style.background = 'var(--light)';
      }
    });
    btn.addEventListener('mouseleave', (e) => {
      if (e.target.style.borderColor !== 'var(--primary)') {
        e.target.style.background = 'white';
      }
    });
  });
};

const openCategoryModal = (id = null) => {
  isEditingCategory = !!id;
  document.getElementById('category-modal-title').innerText = isEditingCategory ? 'Editar Categoría' : 'Nueva Categoría';
  categoryModal.classList.add('open');
  
  // Renderizar el selector de emojis
  renderEmojiPicker();

  if (isEditingCategory) {
    const cat = categories.find(x => x.id === id);
    document.getElementById('edit-category-id').value = cat.id;
    document.getElementById('cat-name').value = cat.name;
    document.getElementById('cat-icon').value = cat.icon || '';
    
    // Resaltar el emoji actual si está en la lista
    setTimeout(() => {
      const currentEmoji = cat.icon;
      const emojiBtn = document.querySelector(`.emoji-btn[data-emoji="${currentEmoji}"]`);
      if (emojiBtn) {
        emojiBtn.style.borderColor = 'var(--primary)';
        emojiBtn.style.background = 'rgba(79, 70, 229, 0.1)';
      }
    }, 100);
  } else {
    categoryForm.reset();
    document.getElementById('edit-category-id').value = '';
  }
};

const closeCategoryModal = () => {
  categoryModal.classList.remove('open');
};

document.getElementById('btn-create-category').addEventListener('click', () => openCategoryModal());
document.getElementById('btn-cancel-category').addEventListener('click', closeCategoryModal);

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const categoryData = {
    name: document.getElementById('cat-name').value,
    icon: document.getElementById('cat-icon').value || '📦'
  };

  try {
    if (isEditingCategory) {
      const id = document.getElementById('edit-category-id').value;
      await categoriesService.updateCategory(id, categoryData);
    } else {
      await categoriesService.addCategory(categoryData);
    }

    await loadData();
    closeCategoryModal();
    showNotification('Éxito', '¡Categoría guardada correctamente! ✅', '💾');
  } catch (error) {
    showNotification('Error', 'Error al guardar la categoría ❌', '⚠️');
  }
});

const deleteCategory = async (id) => {
  const category = categories.find(c => c.id === id);
  const productsInCategory = products.filter(p => p.category === category.name).length;
  
  if (productsInCategory > 0) {
    showNotification('No se puede eliminar', `No puedes eliminar esta categoría porque tiene ${productsInCategory} producto(s) asociado(s). Primero cambia o elimina esos productos.`, '⚠️');
    return;
  }
  
  if (confirm('¿Estás seguro de eliminar esta categoría?')) {
    try {
      await categoriesService.deleteCategory(id);
      await loadData();
    } catch (error) {
      showNotification('Error', 'Error al eliminar la categoría ❌', '⚠️');
    }
  }
};

// 9. Gestión de Pedidos

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: { label: 'Pendiente', color: '#f59e0b', bg: '#fef3c7' },
    processing: { label: 'En Proceso', color: '#3b82f6', bg: '#dbeafe' },
    shipped: { label: 'Enviado', color: '#8b5cf6', bg: '#ede9fe' },
    delivered: { label: 'Entregado', color: '#2A9D8F', bg: '#E0F2F1' }, // Turquesa Ale (bg claro)
    cancelled: { label: 'Cancelado', color: '#E76F51', bg: '#FBE9E7' }  // Coral Naranja (bg claro)
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  return `<span style="background: ${config.bg}; color: ${config.color}; padding: 0.3rem 0.8rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">${config.label}</span>`;
};

const renderOrdersTable = () => {
  const filteredOrders = currentStatusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === currentStatusFilter);

  if (filteredOrders.length === 0) {
    ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 2rem;">No hay pedidos para mostrar.</td></tr>';
    return;
  }

  ordersTableBody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td><strong>#${order.id.substring(0, 8)}</strong></td>
      <td>
        <div><strong>${order.customer.name}</strong></div>
        <small style="color: gray;">${order.customer.phone}</small><br>
        <small style="color: gray;">${order.customer.city}</small>
      </td>
      <td>
        <div>${order.itemCount} producto${order.itemCount > 1 ? 's' : ''}</div>
        <small style="color: gray; display: block; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${order.items.map(i => i.name).join(', ')}</small>
      </td>
      <td><strong>${formatCurrency(order.total)}</strong></td>
      <td>${getStatusBadge(order.status)}</td>
      <td><small>${formatDate(order.createdAt)}</small></td>
      <td>
        <select class="status-select" data-order-id="${order.id}" style="padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-bottom: 0.5rem;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
          <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>En Proceso</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
        </select>
        <button class="btn-view-order" data-order='${JSON.stringify(order)}' style="margin-left: 0.5rem; cursor:pointer; background:none; border:none; font-size: 1.2rem;" title="Ver detalles">👁️</button>
        <button class="btn-delete-order" data-id="${order.id}" style="color:red; cursor:pointer; background:none; border:none; font-size: 1.2rem;" title="Eliminar">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Eventos para cambiar estado
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const orderId = e.target.dataset.orderId;
      const newStatus = e.target.value;
      
      try {
        await ordersService.updateOrderStatus(orderId, newStatus);
        await loadOrders();
        showNotification('Actualizado', 'Estado actualizado correctamente ✅', 'ok');
      } catch (error) {
        showNotification('Error', 'Error al actualizar el estado ❌', '⚠️');
      }
    });
  });

  // Eventos para ver detalles
  document.querySelectorAll('.btn-view-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const order = JSON.parse(e.target.closest('.btn-view-order').dataset.order);
      showOrderDetails(order);
    });
  });

  // Eventos para eliminar
  document.querySelectorAll('.btn-delete-order').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.closest('.btn-delete-order').dataset.id;
      if (confirm('¿Estás seguro de eliminar este pedido?')) {
        try {
          await ordersService.deleteOrder(id);
          await loadOrders();
        } catch (error) {
          showNotification('Error', 'Error al eliminar el pedido ❌', '⚠️');
        }
      }
    });
  });
};

const showOrderDetails = (order) => {
  const details = `
📦 DETALLES DEL PEDIDO #${order.id.substring(0, 8)}

👤 CLIENTE:
Nombre: ${order.customer.name}
Teléfono: ${order.customer.phone}
Email: ${order.customer.email || 'No proporcionado'}
Dirección: ${order.customer.address}
Ciudad: ${order.customer.city}
${order.customer.notes ? `Notas: ${order.customer.notes}` : ''}

🛍️ PRODUCTOS:
${order.items.map(item => `• ${item.name} - ${formatCurrency(item.price)}`).join('\n')}

💰 TOTAL: ${formatCurrency(order.total)}
📅 FECHA: ${formatDate(order.createdAt)}
📊 ESTADO: ${order.status}
  `;
  
  showNotification('Detalles del Pedido', details, '📦');
};

// Filtros de estado
document.querySelectorAll('.filter-status').forEach(btn => {
  btn.addEventListener('click', (e) => {
    currentStatusFilter = e.target.dataset.status;
    
    // Actualizar estilos de botones
    document.querySelectorAll('.filter-status').forEach(b => {
      b.style.background = 'white';
      b.style.color = 'var(--dark)';
      b.classList.remove('active');
    });
    e.target.style.background = 'var(--primary)';
    e.target.style.color = 'white';
    e.target.classList.add('active');
    
    renderOrdersTable();
  });
});



// 10. Sistema de Notificaciones (Admin)
const notificationModal = document.getElementById('notification-modal');
const notificationBtn = document.getElementById('notification-btn');

const showNotification = (title, message, icon = '✨') => {
  document.getElementById('notification-title').innerText = title;
  document.getElementById('notification-message').innerText = message;
  document.getElementById('notification-icon').innerText = icon;
  
  notificationModal.classList.add('active');
};

const closeNotification = () => {
  notificationModal.classList.remove('active');
};

notificationBtn.addEventListener('click', closeNotification);
notificationModal.addEventListener('click', (e) => {
  if (e.target === notificationModal) closeNotification();
});
