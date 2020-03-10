import UserEntity from "../Entities/UserEntity";
import UserRoleEntity from "../Entities/UserRoleEntity";

export default interface IMailerService {
  addNewUser (user: UserEntity): Promise<UserEntity | undefined>;
  createUserRole (userrole: string, id: number): Promise<UserRoleEntity | undefined>;
  changedUserRole (userrole: string, id: number): Promise<UserRoleEntity | undefined>;
  getAllUsers (): Promise<UserEntity | undefined>;
  getUserWithID(id: number): Promise<UserEntity | undefined>;
  getRoleWithID(id: number): Promise<UserEntity | undefined>;
  confirmUser(id: number): Promise<UserEntity | undefined>;
  unconfirmUser(id: number): Promise<UserEntity | undefined>;
  updateUser (id: number, user: UserEntity, salt: string, password: string): Promise<UserEntity | undefined>;
  updateUserPassword (id: number, password: string, salt: string): Promise<UserEntity | undefined>;
  deleteUser(id: number): Promise<UserEntity | undefined>;
  deleteUserSession(id: number): Promise<number>;
  getUserByEmail(email: string): Promise<UserEntity | undefined>;
  getUserRoleByUserId(id: number): Promise<UserRoleEntity | undefined>;
  checkAdminUserRole(id: number): Promise<string>;
}
