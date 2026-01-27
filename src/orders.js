import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";

const COLLECTION_NAME = 'orders';

export const ordersService = {
  // Obtener todos los pedidos
  getOrders: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      return [];
    }
  },

  // Crear un nuevo pedido
  createOrder: async (orderData) => {
    try {
      const order = {
        ...orderData,
        createdAt: Timestamp.now(),
        status: 'pending' // pending, processing, shipped, delivered, cancelled
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), order);
      return { id: docRef.id, ...order };
    } catch (error) {
      console.error("Error al crear pedido:", error);
      throw error;
    }
  },

  // Actualizar estado de un pedido
  updateOrderStatus: async (id, status) => {
    try {
      const orderRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(orderRef, { 
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      throw error;
    }
  },

  // Eliminar un pedido
  deleteOrder: async (id) => {
    try {
      const orderRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      throw error;
    }
  }
};
