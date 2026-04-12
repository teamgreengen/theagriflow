import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    SELLER: 'seller',
    BUYER: 'buyer',
    RIDER: 'rider'
  };

  const signup = async (email, password, name, role, additionalData = {}) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const userDoc = {
      uid: user.uid,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      ...additionalData
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    if (role === ROLES.SELLER) {
      await setDoc(doc(db, 'sellers', user.uid), {
        userId: user.uid,
        storeName: additionalData.storeName || '',
        description: additionalData.description || '',
        verified: false,
        rating: 0,
        totalSales: 0,
        createdAt: new Date().toISOString()
      });
    }

    if (role === ROLES.RIDER) {
      await setDoc(doc(db, 'riders', user.uid), {
        userId: user.uid,
        available: true,
        totalDeliveries: 0,
        rating: 0,
        earnings: 0,
        createdAt: new Date().toISOString()
      });
    }

    setUserData(userDoc);
    return user;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const logout = async () => {
    setUserData(null);
    await signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signup,
    login,
    logout,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};