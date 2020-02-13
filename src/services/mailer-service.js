import nodemailer from 'nodemailer';

const createTransport = async () => {
    return nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'itechartgroup.valerybuko@gmail.com',
            pass: 'ItechArt20?'
        }
    });
}

export const mailer = async (options) => {
    const transport = await createTransport();
    transport.sendMail(options, function (err, info) {
        (err) ? console.log(err) : console.log(`Email sent: ${info.response}`);
    });
};

export const sendUserConfirmation = async (useremail) => {
    const mailOptions = {
        from: 'itechartgroup.valerybuko@gmail.com',
        to: useremail,
        subject: 'Регистрация аккаутна',
        html: `<h1>Регистрация Вашего аккаунта прошла успешно</h1><h2>Для подтверждения перейдите по ссылке <br/><a href=localhost:8000/confirm>Подтвердить регистрацию</a></h2>`
    };

    await mailer(mailOptions);
}

export const sendPasswordConfirmation = async (useremail) => {
    const mailOptions = {
        from: 'itechartgroup.valerybuko@gmail.com',
        to: useremail,
        subject: 'Смена пароля',
        html: `<h2>Для смены пароля перейдите по ссылке <br/><a href=localhost:8000/updatepass>Подтвердить регистрацию</a></h2>`
    };

    await mailer(mailOptions);
}
