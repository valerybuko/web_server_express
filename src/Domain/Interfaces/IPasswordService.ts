export default interface IPasswordService {
  bytesSize: number;
  encodingType: string;
  algorithmType: any;
  generateSalt (): any;
  generateHash (salt: string, password: string): string;
  createUserRole (userrole: string, id: number): any;
  comparePassword (salt: string, password: string, hashedPassword: string): boolean;
}
