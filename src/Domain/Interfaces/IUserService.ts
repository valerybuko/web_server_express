export default interface IMailerService {
  addNewUser (user: any): any;
  createUserRole (userrole: string, id: number): any;
  changedUserRole (userrole: string, id: number): any;
  getAllUsers (): void;
  getUserWithID(id: number): any;
  getRoleWithID(id: number): any;
  confirmUser(id: number): any;
  updateUser (id: number, user: any, salt: string, password: string): any;
  updateUserPassword (id: number, password: string, salt: string): any;
  deleteUser(id: number): any;
  deleteUserSession(id: number): any;
  getUserByEmail(email: string): any;
  getUserRoleByUserId(id: number): any;
  checkAdminUserRole(id: number): any;
}
