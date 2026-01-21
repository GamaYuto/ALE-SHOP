// Datos iniciales de ejemplo (Semilla)
const defaultProducts = [
  {
    id: 1,
    name: "Vestido Floral de Verano",
    category: "Ropa",
    price: 85000,
    stock: 10,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop",
    active: true
  },
  {
    id: 2,
    name: "Kit de Sombras Nude",
    category: "Maquillaje",
    price: 120000,
    stock: 5,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1000&auto=format&fit=crop",
    active: true
  },
  {
    id: 3,
    name: "Bolso de Cuero Artesanal",
    category: "Accesorios",
    price: 180000,
    stock: 3,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
    active: true
  },
  {
    id: 4,
    name: "Labial Rojo Mate",
    category: "Maquillaje",
    price: 45000,
    stock: 15,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=1000&auto=format&fit=crop",
    active: true
  }
];

// Clave para guardar en el navegador
const DB_KEY = 'aleshop_products_v1';

export const storage = {
  // Obtener productos
  getProducts: () => {
    const stored = localStorage.getItem(DB_KEY);
    // Si existen datos guardados, devuélvelos. Si no, devuelve los datos por defecto.
    return stored ? JSON.parse(stored) : defaultProducts;
  },

  // Guardar productos
  saveProducts: (products) => {
    localStorage.setItem(DB_KEY, JSON.stringify(products));
    // Disparar un evento para avisar a otras pestañas que hubo cambios (opcional pero bueno)
    window.dispatchEvent(new Event('storage'));
  },

  // Reiniciar datos (Utilidad)
  reset: () => {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
};
