import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, StudentUser, CompanyUser, UserType } from '../types/user';

export interface StudentRegisterData {
  userType: 'student';
  name: string;
  email: string;
  university?: string;
  faculty?: string;
  year?: number;
}

export interface CompanyRegisterData {
  userType: 'company';
  companyName: string;
  representativeName: string;
  email: string;
  description?: string;
}

export type RegisterData = StudentRegisterData | CompanyRegisterData;

/**
 * ユーザードキュメントを作成
 */
export async function createUserDocument(
  userId: string,
  data: RegisterData
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  if (data.userType === 'student') {
    const studentData: Omit<StudentUser, 'id'> & { createdAt: any } = {
      email: data.email,
      userType: 'student',
      name: data.name,
      university: data.university,
      faculty: data.faculty,
      year: data.year,
      appliedTaskCount: 0,
      completedTaskCount: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, studentData);
  } else {
    const companyData: Omit<CompanyUser, 'id'> & { createdAt: any } = {
      email: data.email,
      userType: 'company',
      companyName: data.companyName,
      representativeName: data.representativeName,
      description: data.description,
      publishedTaskCount: 0,
      createdAt: serverTimestamp(),
    };
    await setDoc(userRef, companyData);
  }
}

/**
 * ユーザー情報を取得
 */
export async function getUserById(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const data = userSnap.data();

  if (data.userType === 'student') {
    return {
      id: userSnap.id,
      email: data.email,
      userType: 'student',
      name: data.name,
      university: data.university,
      faculty: data.faculty,
      year: data.year,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      appliedTaskCount: data.appliedTaskCount ?? 0,
      completedTaskCount: data.completedTaskCount ?? 0,
    } as StudentUser;
  } else {
    return {
      id: userSnap.id,
      email: data.email,
      userType: 'company',
      companyName: data.companyName,
      representativeName: data.representativeName,
      description: data.description,
      logoUrl: data.logoUrl,
      publishedTaskCount: data.publishedTaskCount ?? 0,
    } as CompanyUser;
  }
}

/**
 * 学生プロフィールを更新
 */
export async function updateStudentProfile(
  userId: string,
  updates: Partial<Omit<StudentUser, 'id' | 'email' | 'userType'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * 企業プロフィールを更新
 */
export async function updateCompanyProfile(
  userId: string,
  updates: Partial<Omit<CompanyUser, 'id' | 'email' | 'userType'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * 企業プロフィールを取得（学生向け公開ビュー）
 */
export async function getCompanyProfile(companyId: string): Promise<CompanyUser | null> {
  const user = await getUserById(companyId);
  if (user && user.userType === 'company') {
    return user;
  }
  return null;
}

/**
 * ユーザータイプを確認
 */
export async function getUserType(userId: string): Promise<UserType | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data().userType as UserType;
}
