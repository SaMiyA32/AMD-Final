import React, { createContext, useState, useEffect } from 'react';
import { auth, firestoreDB } from '../services/firebaseSetup';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser: any) => {
      setUser(currentUser as never);
      if (currentUser) {
        // Fetch extended user data from Firestore
        const docSnap = await firestoreDB.collection('Users').doc(currentUser.uid).get();
        if (docSnap.exists) {
          setUserData(docSnap.data() as never);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
