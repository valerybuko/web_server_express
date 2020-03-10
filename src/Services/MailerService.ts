import nodemailer from 'nodemailer';
import { injectable } from 'inversify';
import { IMailerService, MailerModel } from '../Domain';

@injectable()
export default class MailerService implements IMailerService {
    constructor() {
    }

    private createTransport = async () => {
        return nodemailer.createTransport({
            service: `${process.env.MAIL_SERVICE}`,
            auth: {
                user: `${process.env.COMPANY_EMAIL}`,
                pass: `${process.env.COMPANY_PASSWORD}`
            }
        });
    }

    sendUserInitialConfirmation = async (model: MailerModel): Promise<void> => {
        const mailOptions = {
            from: 'itechartgroup.valerybuko@gmail.com',
            to: model.email,
            subject: 'Регистрация аккаутна',
            html: `<h1>Регистрация Вашего аккаунта прошла успешно</h1><h2>Для подтверждения перейдите по ссылке <br/><a href=localhost:8000/confirm?token=${model.token}>Подтвердить регистрацию</a></h2>`
        };

        await this.mailer(mailOptions);
    }

    sendUserChangePasswordConfirmation = async (model: MailerModel): Promise<void> => {
        const mailOptions = {
            from: 'itechartgroup.valerybuko@gmail.com',
            to: model.email,
            subject: 'Смена пароля',
            html: `<h1>Смена пароля</h1><h2>Для подтверждения перейдите по ссылке <br/><a href=localhost:8000/confirm?token=${model.token}>Подтвердить смену пароля</a></h2>`
        };

        await this.mailer(mailOptions);
    }

    sendPasswordConfirmation = async (model: MailerModel): Promise<void> => {
        const mailOptions = {
            from: 'itechartgroup.valerybuko@gmail.com',
            to: model.email,
            subject: 'Смена пароля',
            html: `<h2>Для смены пароля перейдите по ссылке <br/><a href=localhost:8000/updatepass?token=${model.token}>Подтвердить регистрацию</a></h2>`
        };

        await this.mailer(mailOptions);
    }

    private mailer = async (options: any) => {
        const transport = await this.createTransport();
        transport.sendMail(options, function (err, info) {
            (err) ? console.log(err) : console.log(`Email sent: ${info.response}`);
        });
    };

}
