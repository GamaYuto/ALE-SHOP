import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error en login:", error.code);
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error en logout:", error);
    }
  },

  // Escuchar cambios en el estado de autenticación
  subscribeToAuthChanges: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};
