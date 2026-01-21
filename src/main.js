import './style.css';
import { storage } from './storage.js';

// Cargar productos desde el almacenamiento
let products = storage.getProducts();

// 1. Estados de la Aplicación
let cart = [];
let isCartOpen = false;

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
      <a href="#" class="logo">🛍️ Ale<span>Shop</span></a>
      <button id="cart-btn" class="cart-btn">
        🛒 Carrito <span id="cart-count" class="cart-count">0</span>
      </button>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1>Moda que inspira.<br>Estilo que perdura.</h1>
        <p>Descubre las últimas tendencias en ropa, maquillaje y accesorios. Envíos a todo Colombia.</p>
        <button onclick="document.getElementById('products').scrollIntoView({behavior: 'smooth'})" class="btn-cta">Ver Colección</button>
      </div>
    </section>

    <section id="products" class="container">
      <h2 class="products-title">Nuestros Favoritos</h2>
      <div id="product-list" class="products-grid">
        <!-- Los productos se cargarán aquí dinámicamente -->
      </div>
    </section>
  </main>

  <!-- Modal del Carrito -->
  <div id="cart-overlay" class="cart-overlay">
    <div class="cart-modal">
      <div class="cart-header">
        <h3>Tu Carrito</h3>
        <button id="close-cart" class="close-cart">&times;</button>
      </div>
      <div id="cart-items" class="cart-items">
        <!-- Items del carrito -->
        <p style="text-align:center; color: var(--gray);">Tu carrito está vacío.</p>
      </div>
      <div class="cart-total">
        <div class="total-row">
          <span>Total:</span>
          <span id="cart-total-price">$ 0</span>
        </div>
        <button id="checkout-btn" class="btn-checkout">Finalizar Compra (WhatsApp)</button>
      </div>
    </div>
  </div>

  <footer>
    <div class="container footer-content">
      <div class="footer-section">
        <h3>Ale Shop</h3>
        <p>Tu tienda de confianza en Colombia.</p>
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
          <li>WhatsApp: +57 300 123 4567</li>
          <li>Instagram: @aleshop_col</li>
          <li>Bogotá, Colombia</li>
        </ul>
      </div>
    </div>
  </footer>
`;

// 4. Función para mostrar los productos en la pantalla
const renderProducts = () => {
  const productList = document.querySelector('#product-list');
  
  productList.innerHTML = products.map(product => `
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
      const id = parseInt(e.target.dataset.id);
      addToCart(id);
    });
  });
};

// 5. Lógica del Carrito
const addToCart = (id) => {
  const product = products.find(p => p.id === id);
  if (product) {
    cart.push(product);
    updateCartIcon();
    renderCartItems();
    openCart();
    
    // Feedback visual simple (opcional)
    const btn = document.querySelector(`button[data-id="${id}"]`);
    const originalText = btn.innerText;
    btn.innerText = "¡Agregado! ✅";
    setTimeout(() => btn.innerText = originalText, 1500);
  }
};

const removeFromCart = (index) => {
  cart.splice(index, 1);
  updateCartIcon();
  renderCartItems();
};

const updateCartIcon = () => {
  document.querySelector('#cart-count').innerText = cart.length;
};

const renderCartItems = () => {
  const cartItemsContainer = document.querySelector('#cart-items');
  const totalPriceElement = document.querySelector('#cart-total-price');
  
  // Calcular total
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

  // Eventos para eliminar items
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Necesitamos encontrar el botón correcto aunque se haga click en un hijo si lo hubiera
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
};

// 6. Event Listeners Globales
document.querySelector('#cart-btn').addEventListener('click', openCart);
document.querySelector('#close-cart').addEventListener('click', closeCart);
document.querySelector('#cart-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'cart-overlay') closeCart();
});

// Finalizar Compra (Simulación WhatsApp)
document.querySelector('#checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) return alert('¡Tu carrito está vacío!');
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const message = `Hola Ale Shop! Me gustaría comprar estos productos:\n${cart.map(i => `- ${i.name}`).join('\n')}\n\nTotal: ${formatCurrency(total)}`;
  
  // Codificar para URL
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/573001234567?text=${encodedMessage}`, '_blank');
});

// Inicializar la tienda
renderProducts();
