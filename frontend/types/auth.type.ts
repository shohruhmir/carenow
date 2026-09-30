import type { ApiResponse } from "./api.types";

export type ILoginResponse = ApiResponse<{
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}>;

export type TProfile = ApiResponse<{
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  status: number;
  statusName: string;
  avatar: string;
  phone: string;
  auth_key: string;
  roleName: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}>;
