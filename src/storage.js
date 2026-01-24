import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where 
} from "firebase/firestore";

const COLLECTION_NAME = 'products';

export const storage = {
  // Obtener productos desde Firestore
  getProducts: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      // Si la base de datos está vacía, podríamos opcionalmente cargar los defaultProducts
      // Pero para una tienda real, lo ideal es que el admin los cree.
      return products;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return [];
    }
  },

  // Agregar un nuevo producto
  addProduct: async (productData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error("Error al agregar producto:", error);
      throw error;
    }
  },

  // Actualizar un producto existente
  updateProduct: async (id, productData) => {
    try {
      const productRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(productRef, productData);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  },

  // Eliminar un producto
  deleteProduct: async (id) => {
    try {
      const productRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(productRef);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  },

  // Mantener el método saveProducts por compatibilidad si es necesario, 
  // aunque ahora usaremos los métodos individuales.
  saveProducts: async (products) => {
    console.warn("saveProducts (bulk) no es recomendado para Firestore, usa métodos individuales.");
  }
};
