export interface Role {
  id: string;
  name: string;
  totalUsers: number;
}

export interface RoleCreateRequest {
  roleName: string;
}

export interface RoleAssignRequest {
  userId: string;
  roleId: string;
}
