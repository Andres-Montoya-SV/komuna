import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, RegisterData, LoginCredentials } from '@/types/auth.types';

// Ensure Firebase is only used on client side
const ensureClientSide = () => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side');
  }
  if (!auth || !db) {
    throw new Error('Firebase is not initialized. Check your environment variables.');
  }
};

export const firebaseAuth = {
  async register(data: RegisterData): Promise<User | null> {
    ensureClientSide();
    if (!auth || !db) throw new Error('Firebase not initialized');
    
    try {
      // Create user in Firebase Auth
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const firebaseUser = userCredential.user;

      // Update profile with display name
      await updateProfile(firebaseUser, {
        displayName: data.name,
      });

      // Create user document in Firestore
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: data.name,
        role: data.role || 'buyer',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        createdAt: serverTimestamp(),
      });

      return userData;
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  async login(credentials: LoginCredentials): Promise<User | null> {
    ensureClientSide();
    if (!auth || !db) throw new Error('Firebase not initialized');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist (legacy users)
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          role: 'buyer',
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          createdAt: serverTimestamp(),
        });

        return userData;
      }

      const userData = userDoc.data() as User;
      return {
        ...userData,
        id: firebaseUser.uid,
      };
    } catch (error: any) {
      console.error('Firebase login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  async logout(): Promise<void> {
    ensureClientSide();
    if (!auth) throw new Error('Firebase not initialized');
    
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  getCurrentUser(): FirebaseUser | null {
    if (typeof window === 'undefined' || !auth) return null;
    return auth.currentUser;
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (typeof window === 'undefined' || !auth) return () => {};
    
    const { onAuthStateChanged: firebaseOnAuthStateChanged } = require('firebase/auth');
    return firebaseOnAuthStateChanged(auth, callback);
  },
};

