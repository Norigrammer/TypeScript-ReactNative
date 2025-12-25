import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, StudentUser, CompanyUser, isStudentUser, isCompanyUser } from '../types/user';
import { auth } from '../config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import {
  createUserDocument,
  getUserById,
  updateStudentProfile,
  updateCompanyProfile,
  StudentRegisterData,
  CompanyRegisterData,
} from '../api/users-firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (data: StudentRegisterInput) => Promise<void>;
  registerCompany: (data: CompanyRegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<StudentUser> | Partial<CompanyUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 学生登録用の入力データ（パスワード含む）
export interface StudentRegisterInput {
  name: string;
  email: string;
  password: string;
  university?: string;
  faculty?: string;
  year?: number;
}

// 企業登録用の入力データ（パスワード含む）
export interface CompanyRegisterInput {
  companyName: string;
  representativeName: string;
  email: string;
  password: string;
  description?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestoreからユーザー情報を取得してセット
  const fetchAndSetUser = useCallback(async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
      } else {
        // Firestoreにユーザーデータがない場合（レガシーユーザー）
        // Firebase Authの情報から仮のStudentUserを作成
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          const legacyUser: StudentUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            userType: 'student',
            name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'ユーザー'),
            appliedTaskCount: 0,
            completedTaskCount: 0,
          };
          setUser(legacyUser);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchAndSetUser(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, [fetchAndSetUser]);

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchAndSetUser(cred.user.uid);
  }, [fetchAndSetUser]);

  const registerStudent = useCallback(async (data: StudentRegisterInput) => {
    // 1. Firebase Authでユーザー作成
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

    // 2. Firebase Authのプロフィールを更新
    await updateProfile(cred.user, { displayName: data.name });

    // 3. Firestoreにユーザードキュメントを作成
    const registerData: StudentRegisterData = {
      userType: 'student',
      name: data.name,
      email: data.email,
      university: data.university,
      faculty: data.faculty,
      year: data.year,
    };
    await createUserDocument(cred.user.uid, registerData);

    // 4. ユーザー情報を取得してセット
    await fetchAndSetUser(cred.user.uid);
  }, [fetchAndSetUser]);

  const registerCompany = useCallback(async (data: CompanyRegisterInput) => {
    // 1. Firebase Authでユーザー作成
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);

    // 2. Firebase Authのプロフィールを更新（会社名を表示名に）
    await updateProfile(cred.user, { displayName: data.companyName });

    // 3. Firestoreにユーザードキュメントを作成
    const registerData: CompanyRegisterData = {
      userType: 'company',
      companyName: data.companyName,
      representativeName: data.representativeName,
      email: data.email,
      description: data.description,
    };
    await createUserDocument(cred.user.uid, registerData);

    // 4. ユーザー情報を取得してセット
    await fetchAndSetUser(cred.user.uid);
  }, [fetchAndSetUser]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<StudentUser> | Partial<CompanyUser>) => {
    if (!user) return;

    try {
      if (isStudentUser(user)) {
        await updateStudentProfile(user.id, updates as Partial<StudentUser>);
      } else if (isCompanyUser(user)) {
        await updateCompanyProfile(user.id, updates as Partial<CompanyUser>);
      }

      // ローカル状態も更新
      setUser((prev) => {
        if (!prev) return null;
        return { ...prev, ...updates } as User;
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      await fetchAndSetUser(auth.currentUser.uid);
    }
  }, [fetchAndSetUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        registerStudent,
        registerCompany,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
