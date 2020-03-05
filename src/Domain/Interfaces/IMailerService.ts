export default interface IMailerService {
  sendUserConfirmation (email: string, token: string): Promise<void>;
  sendPasswordConfirmation (email: string, token: string): Promise<void>;
}
