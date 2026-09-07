export interface UserDTO {
  _id: string;
  email: string;
  role: 'ADMIN' | 'VOYAGEUR';
  subscription: string;
}