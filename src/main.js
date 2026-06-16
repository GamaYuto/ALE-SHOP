import './style.css';
import { storage } from './storage.js';
import { categoriesService } from './categories.js';

// 1. Estados de la Aplicación
let products = [];
let categories = [];
let cart = storage.getCart(); // Estado inicializado desde LocalStorage
let isCartOpen = false;
let currentFilter = 'all'; // 'all' o el nombre de una categoría

// 2. Utilidad para formatear dinero en Pesos Colombianos (COP)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(value);
};

// 3. Estructura Principal del HTML
document.querySelector('#app').innerHTML = `
  <header>
    <div class="container header-content">
      <a href="#" class="logo">
        <img src="/LOGO.svg" alt="Vittoria Joyas Logo" style="height: 45px; width: auto;">
      </a>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <a href="/admin.html" class="btn-secondary" style="text-decoration: none; font-size: 0.9rem; padding: 0.5rem 1rem;">⚙️ Admin</a>
        <button id="cart-btn" class="cart-btn">
          🛒 Carrito <span id="cart-count" class="cart-count">0</span>
        </button>
      </div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1 style="font-family: var(--font-heading); color: var(--ale-accent); font-size: 3.5rem; margin-bottom: 1rem;">Lujo que inspira.<br>Oro Laminado 18K.</h1>
        <p style="color: #FFFFFF; font-size: 1.2rem; max-width: 600px; margin: 0 auto 2rem;">Boutique digital de joyería fina. Elegancia y durabilidad con 5 años de garantía certificada.</p>
        <button onclick="document.getElementById('products').scrollIntoView({behavior: 'smooth'})" class="btn-cta" style="background: var(--ale-accent); color: #000000; border-radius: 2px; font-weight: bold; padding: 1rem 2.5rem; text-transform: uppercase; letter-spacing: 1px;">Ver Colección</button>
      </div>
    </section>

    <!-- Trust / Warranty Banner -->
    <section class="trust-banner" style="background: var(--bg-light); padding: 4rem 0; margin-bottom: 4rem; border-top: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05);">
      <div class="container" style="text-align: center; max-width: 800px;">
        <h2 style="font-family: var(--font-heading); font-size: 2.2rem; color: var(--ale-dark); margin-bottom: 0.5rem;">
          GARANTÍA 🔒💎✍️<br>
          <span style="font-size: 1.1rem; font-family: var(--font-body); font-weight: 400; color: var(--text-main);">(Incluye tarjeta física de garantía)</span>
        </h2>
        
        <p style="color: var(--text-main); font-size: 1.1rem; line-height: 1.8; margin: 2rem auto;">
          Nuestras joyas son elaboradas bajo estrictos estándares internacionales de calidad y cuentan con un respaldo exclusivo de <strong>5 AÑOS DE GARANTÍA</strong>:
        </p>

        <ul style="list-style: none; padding: 0; margin: 0 auto 2.5rem; text-align: left; display: inline-block; font-size: 1.05rem; line-height: 1.8; color: var(--text-main);">
          <li><span style="color: var(--ale-accent); margin-right: 0.5rem;">💠</span> Diseñadas para conservar su color y acabado ✨✨</li>
          <li><span style="color: var(--ale-accent); margin-right: 0.5rem;">💠</span> Oro Laminado 18K italiano</li>
          <li><span style="color: var(--ale-accent); margin-right: 0.5rem;">💠</span> Durabilidad comprobada en laboratorio 🔬</li>
          <li><span style="color: var(--ale-accent); margin-right: 0.5rem;">💠</span> Joyas creadas para acompañarte en cada momento especial ✨✨</li>
        </ul>

        <div style="background: var(--white); padding: 2rem; border-radius: var(--radius); border: 1px solid rgba(0,0,0,0.03); box-shadow: var(--shadow-sm); margin-bottom: 3rem; text-align: left;">
          <p style="color: var(--text-main); font-size: 1.05rem; line-height: 1.7; margin: 0;">
            <span style="font-size: 1.5rem; vertical-align: middle; margin-right: 0.5rem;">🔬</span> 
            Fundimos Oro 18K sobre titanio, creando un blindaje con el color, brillo y textura del Oro Italiano. Su resistencia está comprobada en laboratorio, y nuestra garantía es <strong>100% certificada</strong>.
          </p>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2.5rem; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 2.5rem;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <span style="font-size: 2rem;">🏆</span>
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--ale-dark); text-transform: uppercase; letter-spacing: 1px;">100% Garantizado</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <span style="font-size: 2rem;">⭐</span>
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--ale-dark); text-transform: uppercase; letter-spacing: 1px;">100% Satisfacción</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <span style="font-size: 2rem;">🚚</span>
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--ale-dark); text-transform: uppercase; letter-spacing: 1px;">Envío Gratis</span>
          </div>
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
            <span style="font-size: 2rem;">🤝</span>
            <span style="font-weight: 600; font-size: 0.85rem; color: var(--ale-dark); text-transform: uppercase; letter-spacing: 1px;">Pagas al Recibir</span>
          </div>
        </div>
      </div>
    </section>

    <section id="products" class="container">
      <h2 class="products-title" style="font-family: var(--font-heading); font-size: 2.5rem; color: var(--ale-dark);">Colección Exclusiva</h2>
      
      <!-- Filtros de Categorías -->
      <div id="category-filters" style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem; justify-content: center;">
        <!-- Los filtros se cargarán aquí dinámicamente -->
      </div>
      
      <div id="product-list" class="products-grid">
        <!-- Los productos se cargarán aquí dinámicamente -->
      </div>
    </section>
  </main>

  <!-- Modal del Carrito -->
  <div id="cart-overlay" class="cart-overlay">
    <div class="cart-modal">
      <div class="cart-header">
        <h3 id="cart-title">Tu Carrito</h3>
        <button id="close-cart" class="close-cart">&times;</button>
      </div>
      
      <!-- Vista del Carrito -->
      <div id="cart-view">
        <div id="cart-items" class="cart-items">
          <!-- Items del carrito -->
          <p style="text-align:center; color: var(--gray);">Tu carrito está vacío.</p>
        </div>
        <div class="cart-total">
          <div class="total-row">
            <span>Total:</span>
            <span id="cart-total-price">$ 0</span>
          </div>
          <button id="proceed-checkout-btn" class="btn-checkout">Continuar con la Compra</button>
        </div>
      </div>
      
      <!-- Vista del Formulario de Checkout -->
      <div id="checkout-view" style="display: none;">
        <form id="checkout-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input type="text" id="customer-name" required class="input-field" placeholder="Juan Pérez">
          </div>
          
          <div class="form-group">
            <label>Teléfono/WhatsApp *</label>
            <input type="tel" id="customer-phone" required class="input-field" placeholder="300 123 4567">
          </div>
          
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" id="customer-email" class="input-field" placeholder="correo@ejemplo.com">
          </div>
          
          <div class="form-group">
            <label>Dirección de Envío *</label>
            <input type="text" id="customer-address" required class="input-field" placeholder="Calle 123 #45-67">
          </div>
          
          <div class="form-group">
            <label>Ciudad *</label>
            <input type="text" id="customer-city" required class="input-field" placeholder="Bogotá">
          </div>
          
          <div class="form-group">
            <label>Notas adicionales (opcional)</label>
            <textarea id="customer-notes" class="input-field" rows="3" placeholder="Ej: Entregar en la portería"></textarea>
          </div>
          
          <div class="cart-total" style="margin-top: 1rem;">
            <div class="total-row">
              <span>Total a Pagar:</span>
              <span id="checkout-total-price">$ 0</span>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button type="button" id="back-to-cart-btn" class="btn-secondary" style="flex: 1;">Volver al Carrito</button>
              <button type="submit" class="btn-checkout" style="flex: 1;">Confirmar Pedido</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>

  <footer>
    <div class="container footer-content">
      <div class="footer-section">
        <h3>Vittoria Joyas</h3>
        <p>Tu joyería fina de confianza en Colombia.</p>
      </div>
      <div class="footer-section">
        <h3>Ayuda</h3>
        <ul>
          <li>Envíos y Devoluciones</li>
          <li>Preguntas Frecuentes</li>
          <li>Guía de Tallas</li>
        </ul>
      </div>
      <div class="footer-section">
        <h3>Contacto</h3>
        <ul>
          <li>WhatsApp: +57 301 508 5520</li>
          <li>Instagram: @vittoriajoyas</li>
          <li>Barranquilla, Colombia</li>
        </ul>
      </div>
    </div>
  </footer>
`;

// 4. Función para renderizar los filtros de categorías
const renderCategoryFilters = () => {
  const filtersContainer = document.querySelector('#category-filters');

  const allButton = `
    <button class="category-filter ${currentFilter === 'all' ? 'active' : ''}" data-category="all">
      🌟 Todos
    </button>
  `;

  const categoryButtons = categories.map(cat => `
    <button class="category-filter ${currentFilter === cat.name ? 'active' : ''}" data-category="${cat.name}">
      ${cat.icon || '📦'} ${cat.name}
    </button>
  `).join('');

  filtersContainer.innerHTML = allButton + categoryButtons;

  // Agregar eventos a los botones de filtro
  document.querySelectorAll('.category-filter').forEach(button => {
    button.addEventListener('click', (e) => {
      currentFilter = e.target.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
};

// 5. Función para mostrar los productos en la pantalla
const renderProducts = () => {
  const productList = document.querySelector('#product-list');

  // Filtrar productos según la categoría seleccionada
  const filteredProducts = currentFilter === 'all'
    ? products.filter(p => p.active !== false)
    : products.filter(p => p.category === currentFilter && p.active !== false);

  if (filteredProducts.length === 0) {
    productList.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 2rem;">No hay productos disponibles en esta categoría.</p>';
    return;
  }

  productList.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <button class="btn-add" data-id="${product.id}">
          Agregar al Carrito
        </button>
      </div>
    </article>
  `).join('');

  // Añadir eventos a los botones de "Agregar"
  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      addToCart(id);
    });
  });
};

// 5. Lógica del Carrito
const addToCart = (id) => {
  const product = products.find(p => p.id === id);
  if (product) {
    cart.push(product);
    // Guarda en LocalStorage y despacha 'cart-updated'
    storage.saveCart(cart);
    openCart();

    const btn = document.querySelector(`button[data-id="${id}"]`);
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = "¡Agregado! ✅";
      setTimeout(() => btn.innerText = originalText, 1500);
    }
  }
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  // Guarda en LocalStorage y despacha 'cart-updated'
  storage.saveCart(cart);
};

// Escuchador global de eventos (Arquitectura desacoplada)
window.addEventListener('cart-updated', () => {
  // Sincronizar estado y renderizar UI
  cart = storage.getCart();
  updateCartIcon();
  renderCartItems();
});

const updateCartIcon = () => {
  document.querySelector('#cart-count').innerText = cart.length;
};

const renderCartItems = () => {
  const cartItemsContainer = document.querySelector('#cart-items');
  const totalPriceElement = document.querySelector('#cart-total-price');

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  totalPriceElement.innerText = formatCurrency(total);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--gray); margin-top: 2rem;">Tu carrito está vacío 😢</p>';
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div style="flex-grow:1;">
        <h4>${item.name}</h4>
        <p style="color:var(--primary); font-weight:700;">${formatCurrency(item.price)}</p>
      </div>
      <button class="remove-btn" data-index="${index}" style="background:none; border:none; color:red; cursor:pointer;">
        🗑️
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.remove-btn').dataset.index);
      removeFromCart(index);
    });
  });
};

const openCart = () => {
  isCartOpen = true;
  document.querySelector('#cart-overlay').classList.add('open');
};

const closeCart = () => {
  isCartOpen = false;
  document.querySelector('#cart-overlay').classList.remove('open');
  // Volver a la vista del carrito al cerrar
  showCartView();
};

// Navegación entre vistas del modal
const showCartView = () => {
  document.getElementById('cart-view').style.display = 'block';
  document.getElementById('checkout-view').style.display = 'none';
  document.getElementById('cart-title').innerText = 'Tu Carrito';
};

const showCheckoutView = () => {
  if (cart.length === 0) {
    showNotification('Carrito Vacío', '¡Tu carrito está vacío!', '🛒');
    return;
  }

  document.getElementById('cart-view').style.display = 'none';
  document.getElementById('checkout-view').style.display = 'block';
  document.getElementById('cart-title').innerText = 'Datos de Envío';

  // Actualizar el total en el checkout
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById('checkout-total-price').innerText = formatCurrency(total);
};

// 6. Event Listeners Globales
document.querySelector('#cart-btn').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
document.querySelector('#cart-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'cart-overlay') closeCart();
});

// Botón para proceder al checkout
document.querySelector('#proceed-checkout-btn').addEventListener('click', showCheckoutView);

// Botón para volver al carrito
document.querySelector('#back-to-cart-btn').addEventListener('click', showCartView);

// Manejar el envío del formulario de checkout
document.querySelector('#checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    showNotification('Carrito Vacío', '¡Tu carrito está vacío!', '🛒');
    return;
  }

  // Recopilar datos del cliente
  const customerData = {
    name: document.getElementById('customer-name').value,
    phone: document.getElementById('customer-phone').value,
    email: document.getElementById('customer-email').value || '',
    address: document.getElementById('customer-address').value,
    city: document.getElementById('customer-city').value,
    notes: document.getElementById('customer-notes').value || ''
  };

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Preparar datos del pedido
  const orderData = {
    customer: customerData,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image
    })),
    total: total,
    itemCount: cart.length
  };

  try {
    // Importar el servicio de pedidos dinámicamente
    const { ordersService } = await import('./orders.js');
    const { storage } = await import('./storage.js');

    // Crear el pedido en Firestore
    const newOrder = await ordersService.createOrder(orderData);

    // Reducir el stock de cada producto
    for (const item of cart) {
      const product = products.find(p => p.id === item.id);
      if (product && product.stock > 0) {
        await storage.updateProduct(item.id, {
          ...product,
          stock: product.stock - 1
        });
      }
    }

    // Mensaje de WhatsApp
    const message = `🛍️ *Nuevo Pedido #${newOrder.id.substring(0, 8)}*\n\n` +
      `👤 *Cliente:* ${customerData.name}\n` +
      `📱 *Teléfono:* ${customerData.phone}\n` +
      `📍 *Dirección:* ${customerData.address}, ${customerData.city}\n\n` +
      `📦 *Productos:*\n${cart.map(i => `• ${i.name} - ${formatCurrency(i.price)}`).join('\n')}\n\n` +
      `💰 *Total: ${formatCurrency(total)}*\n\n` +
      `${customerData.notes ? `📝 *Notas:* ${customerData.notes}` : ''}`;

    // Codificación estricta del string para URL de WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/573015085520?text=${encodedMessage}`;

    // Limpiar carrito de manera reactiva
    cart = [];
    storage.saveCart(cart);

    // Resetear formulario
    document.getElementById('checkout-form').reset();

    // Cerrar modal
    closeCart();

    // Mostrar confirmación y redirigir al cerrar
    showNotification(
      '¡Pedido Exitoso!',
      'Tu pedido ha sido registrado. Te redirigiremos a WhatsApp para enviar los detalles.',
      '🎉',
      () => {
        window.open(whatsappUrl, '_blank');
      }
    );

  } catch (error) {
    console.error('Error al crear el pedido:', error);
    showNotification('Error', 'Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.', '❌');
  }
});

// 7. Sistema de Notificaciones
const notificationModal = document.getElementById('notification-modal');
const notificationBtn = document.getElementById('notification-btn');
let notificationCallback = null;

const showNotification = (title, message, icon = '✨', callback = null) => {
  document.getElementById('notification-title').innerText = title;
  document.getElementById('notification-message').innerText = message;
  document.getElementById('notification-icon').innerText = icon;

  notificationCallback = callback;
  notificationModal.classList.add('active');
};

const closeNotification = () => {
  notificationModal.classList.remove('active');
  if (notificationCallback) {
    notificationCallback();
    notificationCallback = null;
  }
};

notificationBtn.addEventListener('click', closeNotification);
// Cerrar al hacer clic fuera
notificationModal.addEventListener('click', (e) => {
  if (e.target === notificationModal) closeNotification();
});

// Cargar productos y categorías desde Firestore de forma asíncrona e inicializar
async function init() {
  categories = await categoriesService.getCategories();
  products = await storage.getProducts();
  renderCategoryFilters();
  renderProducts();
}

init();

