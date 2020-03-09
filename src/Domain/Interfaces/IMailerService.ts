import MailerModel from '../Models/MailModel';

export default interface IMailerService {
  sendUserInitialConfirmation (model: MailerModel): Promise<void>;
  sendPasswordConfirmation (model: MailerModel): Promise<void>;
  sendUserChangePasswordConfirmation (model: MailerModel): Promise<void>;
}
