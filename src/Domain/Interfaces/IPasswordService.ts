export default interface IPasswordService {
  bytesSize: number;
  encodingType: string;
  algorithmType: any;
  generateSalt (): string;
  generateHash (salt: string, password: string): string;
  comparePassword (salt: string, password: string, hashedPassword: string): boolean;
}
