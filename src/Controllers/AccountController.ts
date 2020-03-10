import express, { Router, Response, Request } from 'express';
import 'reflect-metadata';
import types from '../Ioc/types';
import { inject, injectable } from 'inversify';
import {
    IAuthorizeService,
    IMailerService,
    IPasswordService,
    MailerModel,
    IUserService,
    IAccountController
} from '../Domain';
import HttpStatus from 'http-status-codes';
import PromiseMiddleware from "../Middlewares/PromiseMiddleware";
import AuthorizationMiddleware from "../Middlewares/AuthorizationMiddleware";
const { check, validationResult } = require('express-validator/check');

const router = express.Router();

@injectable()
export default class AccountController implements IAccountController {
    router: Router;
    REFRESH_TOKEN_SECRET: string | undefined;
    private readonly authorizeService: IAuthorizeService
    private readonly passwordService: IPasswordService
    private readonly mailerService: IMailerService
    private readonly userService: IUserService

    constructor(@inject(types.MailerService) mailerService: IMailerService,
                @inject(types.AuthorizeService) authorizeService: IAuthorizeService,
                @inject(types.UserService) userService: IUserService,
                @inject(types.PasswordService) passwordService: IPasswordService) {
        this.router = express.Router();
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
        this.authorizeService = authorizeService;
        this.userService = userService;
        this.passwordService = passwordService;
        this.mailerService = mailerService;
        this.initializeRoutes();
    }

    private checkValidation = () => {
        const checkingArray = [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({ min: 5 })
        ];
        return checkingArray;
    }

    private checkEmailBeforePasswordReset = () => {
        const checkingArray = [
            check('user_email', 'Wrong email address').normalizeEmail().isEmail(),
            check('confirmation_email', 'Wrong email address').normalizeEmail().isEmail()
        ];
        return checkingArray;
    }

    private checkPasswordBeforeUpdate = () => {
        const checkingArray = [
            check('newPassword', 'Enter a password with five or more characters').isLength({ min: 5 })
        ];
        return checkingArray;
    }

    private initializeRoutes = () => {
        const path = '/api/account';

        this.router.post(`${path}/create`, this.checkValidation(), PromiseMiddleware(this.createAccount));
        this.router.put(`${path}/confirm`, PromiseMiddleware(this.confirmAccount));
        this.router.post(`${path}/login`, this.checkValidation(), PromiseMiddleware(this.loginAccount));
        this.router.post(`${path}/logout`, AuthorizationMiddleware(), PromiseMiddleware(this.logoutAccount));
        this.router.post(`${path}/changepass`, this.checkEmailBeforePasswordReset(), PromiseMiddleware(this.changePasswordAccount));
        this.router.put(`${path}/updatepass`, this.checkPasswordBeforeUpdate(), PromiseMiddleware(this.updatePasswordAccount));
        this.router.put(`${path}/refresh`, PromiseMiddleware(this.refreshTokensAccount));

        return router;
    }

    createAccount = async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }

        const { userrole, username, email, salt, city, birthdate, confirmation_email } = req.body;

        if (userrole !== 'user') {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        if (!username || !salt || !userrole || !city || !birthdate) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const appuser = await this.userService.getUserByEmail(email);

        if (appuser) {
            return res.status(HttpStatus.CONFLICT).send();
        }

        const newUser = await this.userService.addNewUser(req.body);
        const newUserId = newUser.id;
    
        
        const userRole = await this.userService.createUserRole(userrole, newUserId);
        const confirmationToken = await this.authorizeService.createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`);

        const mailerModel: MailerModel = { email: req.body.confirmation_email, token: confirmationToken }

        await this.mailerService.sendUserInitialConfirmation(mailerModel);

        res.status(HttpStatus.CREATED).send();
    }
    confirmAccount = async (req: Request, res: Response): Promise<any> => {
        const token = req.query.token;

        const userObject = await this.authorizeService.getConfirmationToken(token);

        if (!userObject) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isValid: any = this.authorizeService.verifyToken(token, this.REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const userId = userObject.userId;

        await this.userService.confirmUser(userId);

        await this.authorizeService.deleteConfirmationToken(token);

        res.status(HttpStatus.OK).send();
    }
    loginAccount = async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const appuserObject: any = await this.userService.getUserByEmail(email);

        if (!appuserObject) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const appuser = appuserObject.dataValues;
        const isUserConfirm = appuser.isConfirm;

        if (!isUserConfirm) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isCorrectPassword = this.passwordService.comparePassword(appuser.salt, password, appuser.password);
        if (!isCorrectPassword) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const refreshToken = await this.authorizeService.createRefreshToken(appuser, `${process.env.JWT_REFRESH_LIFETIME}`);
        const userSessionNumber = refreshToken.id;

        const accessToken = await this.authorizeService.saveSessionToRedis(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, userSessionNumber);

        const tokens = {
            refreshToken: refreshToken.tokenname,
            accessToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
    logoutAccount = async (req: Request, res: Response) => {
        await this.authorizeService.deleteSession(req.body.id);
        await this.userService.deleteUserSession(req.body.id);
        res.send();
    }
    changePasswordAccount = async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.OK).json({ errors: errors.array() });
        }

        const email = req.body.user_email;
        //const confirmationEmail = req.body.confirmation_email;
        const userObject: any = await this.userService.getUserByEmail(email);

        if (!userObject) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        const user = userObject.dataValues;

        if (!user.isConfirm) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const changePasswordTokenObject: any = await this.authorizeService.createChangePasswordToken(user, `${process.env.JWT_VERIFY_LIFETIME}`);
        const token = changePasswordTokenObject.dataValues.tokenname;


        if (!token) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const mailerModel: MailerModel = { email: req.body.confirmation_email, token }
        await this.mailerService.sendPasswordConfirmation({ email: req.body.confirmation_email, token });

        res.status(HttpStatus.OK).send();
    }
    updatePasswordAccount = async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }

        const token = req.query.token;
        const isValid = this.authorizeService.verifyToken(token, this.REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isConfirmToken = await this.authorizeService.getChangePasswordToken(token);

        if (!isConfirmToken) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userId = isConfirmToken.userId;
        const newUserObject: any = await this.userService.getUserWithID(userId);

        if (!newUserObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const newUser = newUserObject.dataValues;

        const salt = this.passwordService.generateSalt();
        const password = this.passwordService.generateHash(salt, req.body.newPassword);
        await this.userService.updateUserPassword(userId, password, salt);

        await this.authorizeService.deleteSession(newUser.id);
        await this.userService.deleteUserSession(newUser.id);

        await this.userService.unconfirmUser(userId);
        this.authorizeService.deleteChangePasswordToken(token);

        const confirmationToken = await this.authorizeService.createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`);
        const mailerModel: MailerModel = { email: req.body.confirmation_email, token: confirmationToken }
        await this.mailerService.sendUserChangePasswordConfirmation(mailerModel);

        res.status(HttpStatus.OK).send();
    }
    refreshTokensAccount = async (req: Request, res: Response): Promise<any> => {
        const token = req.body.refreshToken;
        const refreshTokenObject = await this.authorizeService.getRefreshToken(token);

        if (!refreshTokenObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userID = refreshTokenObject.userId;
        const userObject: any = await this.userService.getUserWithID(userID);

        if (!userObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const user = userObject.dataValues;
        const refreshToken = await this.authorizeService.updateRefreshToken(user, req.body.refreshToken);
        const accessToken = await this.authorizeService.updateAccessToken(userID, user, '1h');
        const tokens = {
            accessToken,
            refreshToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
}
