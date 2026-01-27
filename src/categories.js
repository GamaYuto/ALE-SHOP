import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

const COLLECTION_NAME = 'categories';

export const categoriesService = {
  // Obtener categorías desde Firestore
  getCategories: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      
      // Si no hay categorías, devolver las predeterminadas
      if (categories.length === 0) {
        return [
          { id: 'default-1', name: 'Ropa', icon: '👗' },
          { id: 'default-2', name: 'Maquillaje', icon: '💄' },
          { id: 'default-3', name: 'Accesorios', icon: '👜' }
        ];
      }
      
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
    }
  },

  // Agregar una nueva categoría
  addCategory: async (categoryData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      throw error;
    }
  },

  // Actualizar una categoría existente
  updateCategory: async (id, categoryData) => {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(categoryRef, categoryData);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      throw error;
    }
  },

  // Eliminar una categoría
  deleteCategory: async (id) => {
    try {
      const categoryRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      throw error;
    }
  }
};
