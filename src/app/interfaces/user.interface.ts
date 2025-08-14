export interface User {
  id: number;
  email: string;
  fullName: string;
  username?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  username?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Role[];
  isAdmin: boolean;
}

export interface UserDetailDto {
  id?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  phoneNumber?: string;
  phoneNumberConfirmed?: boolean;
  accessFailedCount?: number;
}
