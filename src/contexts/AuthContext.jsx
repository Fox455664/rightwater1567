// src/contexts/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { Loader2 } from 'lucide-react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // جلب بيانات الأدمن واليوزر في نفس الوقت لتحسين الأداء
          const adminDocPromise = getDoc(doc(db, "admins", user.uid));
          const userDocPromise = getDoc(doc(db, "users", user.uid));
          
          const [adminDoc, userDoc] = await Promise.all([adminDocPromise, userDocPromise]);
          
          setIsAdmin(adminDoc.exists());

          // يمكنك هنا تحديث بيانات المستخدم في Context لو احتجت (مثل الدور أو بيانات إضافية)
          // if (userDoc.exists()) {
          //   // setUserData(userDoc.data());
          // }

        } catch (error) {
          console.error("خطأ في التحقق من الصلاحيات:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      // -- التحسين الثاني: لا نوقف التحميل إلا بعد التأكد من كل شيء --
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- دوال المصادقة ---

  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // تحديث ملف المستخدم في Auth
    await updateProfile(user, { displayName });
    
    // إنشاء ملف المستخدم في Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      createdAt: serverTimestamp(),
      role: 'user'
    });
    
    // -- التحسين الأول: تم إزالة setCurrentUser من هنا --
    // onAuthStateChanged سيتولى المهمة تلقائياً.
    
    return user;
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const sendPasswordReset = (email) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`
    });
  };

  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    await updateProfile(currentUser, updates);
    // -- التحسين الأول: تم إزالة setCurrentUser من هنا --
    // onAuthStateChanged سيقوم بالتحديث.
  };
  
  const reauthenticateAndChangePassword = async (currentPassword, newPassword) => {
    if (!currentUser) throw new Error("No user is currently signed in.");
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await firebaseUpdatePassword(currentUser, newPassword);
  };

  // تجميع كل القيم والدوال
  const value = {
    currentUser,
    isAdmin,
    loading,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updateUserProfile,
    reauthenticateAndChangePassword,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 rtl:mr-4 text-xl text-foreground">جاري تحميل بيانات المستخدم...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
