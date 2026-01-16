import { ImageSourcePropType } from 'react-native';

export interface AvatarOption {
  id: number;
  source: ImageSourcePropType;
}

// 学生用アバター
export const STUDENT_AVATARS: AvatarOption[] = [
  { id: 1, source: require('../../assets/avatars/student/student-1.png') },
  { id: 2, source: require('../../assets/avatars/student/student-2.png') },
  { id: 3, source: require('../../assets/avatars/student/student-3.png') },
  { id: 4, source: require('../../assets/avatars/student/student-4.png') },
  { id: 5, source: require('../../assets/avatars/student/student-5.png') },
  { id: 6, source: require('../../assets/avatars/student/student-6.png') },
  { id: 7, source: require('../../assets/avatars/student/student-7.png') },
  { id: 8, source: require('../../assets/avatars/student/student-8.png') },
  { id: 9, source: require('../../assets/avatars/student/student-9.png') },
  { id: 10, source: require('../../assets/avatars/student/student-10.png') },
];

// 企業用アバター
export const COMPANY_AVATARS: AvatarOption[] = [
  { id: 1, source: require('../../assets/avatars/company/company-1.png') },
  { id: 2, source: require('../../assets/avatars/company/company-2.png') },
  { id: 3, source: require('../../assets/avatars/company/company-3.png') },
  { id: 4, source: require('../../assets/avatars/company/company-4.png') },
  { id: 5, source: require('../../assets/avatars/company/company-5.png') },
  { id: 6, source: require('../../assets/avatars/company/company-6.png') },
  { id: 7, source: require('../../assets/avatars/company/company-7.png') },
  { id: 8, source: require('../../assets/avatars/company/company-8.png') },
  { id: 9, source: require('../../assets/avatars/company/company-9.png') },
  { id: 10, source: require('../../assets/avatars/company/company-10.png') },
];

// デフォルトアバターID
export const DEFAULT_STUDENT_AVATAR_ID = 1;
export const DEFAULT_COMPANY_AVATAR_ID = 1;

// アバターIDから画像を取得するヘルパー関数
export function getStudentAvatarSource(avatarId?: number): ImageSourcePropType {
  const id = avatarId ?? DEFAULT_STUDENT_AVATAR_ID;
  const avatar = STUDENT_AVATARS.find((a) => a.id === id);
  return avatar?.source ?? STUDENT_AVATARS[0].source;
}

export function getCompanyAvatarSource(avatarId?: number): ImageSourcePropType {
  const id = avatarId ?? DEFAULT_COMPANY_AVATAR_ID;
  const avatar = COMPANY_AVATARS.find((a) => a.id === id);
  return avatar?.source ?? COMPANY_AVATARS[0].source;
}
