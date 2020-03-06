import MailerModel from '../Models/MailModel';

export default interface IMailerService {
  sendUserConfirmation (model: MailerModel): Promise<void>;
  sendPasswordConfirmation (model: MailerModel): Promise<void>;
}
