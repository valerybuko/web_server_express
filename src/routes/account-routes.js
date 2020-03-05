import express from 'express';
import HttpStatus from 'http-status-codes';
import UserService, {
    addNewUser,
    createUserRole,
    getUserByEmail,
    getUserWithID,
    confirmUser,
    updateUserPassword
} from "../services/user-service";
import {
    createRefreshToken,
    saveSessionToRedis,
    REFRESH_TOKEN_SECRET,
    updateRefreshToken,
    updateAccessToken,
    getRefreshToken,
    verifyToken,
    createChangePasswordToken,
    getConfirmationToken,
    deleteConfirmationToken,
    getChangePasswordToken,
    createConfirmationToken,
    deleteChangePasswordToken, deleteSession, getSessionData
} from "../services/auth-service";
import CorrectPasswordCheck from "../checkCorrectPassword";
import MailerService, {sendPasswordConfirmation, sendUserConfirmation} from "../services/mailer-service";
import badRequestErrorHandler from "../middleware/BadRequestErrorHandler";
import authorize from '../middleware/Authorization';
import jwtDecode from 'jwt-decode';
import AuthorizeService from "../services/auth-service";
import PasswordHelper from "../passwordHelper";

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

export default class AccountController {
    router;

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
        this.authorizeService = new AuthorizeService();
        this.userService = new UserService();
        this.passwordCheck = new CorrectPasswordCheck();
        this.passwordHelper = new PasswordHelper();
        this.mailerService = new MailerService();
    }

    checkValidation = () => {
        const checkingArray = [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ];
        return checkingArray;
    }

    checkEmailBeforePasswordReset = () => {
        const checkingArray = [
            check('user_email', 'Wrong email address').normalizeEmail().isEmail(),
            check('confirmation_email', 'Wrong email address').normalizeEmail().isEmail()
        ];
        return checkingArray;
    }

    checkPasswordBeforeUpdate = () => {
        const checkingArray = [
            check('newPassword', 'Enter a password with five or more characters').isLength({min: 5})
        ];
        return checkingArray;
    }

    initializeRoutes = () => {
        const path = '/api/account';

        this.router.post(`${path}/create`, this.checkValidation(), this.createAccount);
        this.router.put(`${path}/confirm`, this.confirmAccount);
        this.router.post(`${path}/login`, this.checkValidation(), this.loginAccount);
        this.router.post(`${path}/logout`, this.logoutAccount);
        this.router.post(`${path}/changepass`, this.checkEmailBeforePasswordReset(), this.changePasswordAccount);
        this.router.put(`${path}/updatepass`, this.checkPasswordBeforeUpdate(), this.updatePasswordAccount);
        this.router.put(`${path}/refresh`, this.refreshTokensAccount);

        return router;
    }

    createAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const {userrole, username, email, salt, city, birthdate, confirmation_email} = req.body;

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
        const newUserId = newUser.dataValues.id;
        const userRole = await this.userService.createUserRole(userrole, newUserId);
        const confirmationToken = await this.authorizeService.createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`);

        await this.mailerService.sendUserConfirmation(confirmation_email, confirmationToken.tokenname);

        res.status(HttpStatus.CREATED).send();
    }
    confirmAccount = async (req, res) => {
        const token = req.query.token;

        const userObject = await this.authorizeService.getConfirmationToken(token);

        if (!userObject) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isValid = this.authorizeService.verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const userId = userObject.dataValues.userId;

        await this.userService.confirmUser(userId);

        await this.authorizeService.deleteConfirmationToken(token);

        res.status(HttpStatus.OK).send();
    }
    loginAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.UNAUTHORIZED).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        const appuserObject = await this.userService.getUserByEmail(email);

        if (!appuserObject) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const appuser = appuserObject.dataValues;
        const isUserConfirm = appuser.isConfirm;

        if (!isUserConfirm) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isCorrectPassword = this.passwordCheck.comparePassword(password, appuser.salt, appuser.password);
        if (!isCorrectPassword) {
            res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const refreshToken = await this.authorizeService.createRefreshToken(appuser, `${process.env.JWT_REFRESH_LIFETIME}`);
        const userSessionNumber = refreshToken.dataValues.id;

        const accessToken = await this.authorizeService.saveSessionToRedis(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, userSessionNumber);

        const tokens = {
            refreshToken: refreshToken.tokenname,
            accessToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
    logoutAccount = async (req, res) => {
        const sessionDataObject = await this.authorizeService.getSessionData(req.body.id);
        const sessionId = sessionDataObject.dataValues.id;
        await this.authorizeService.deleteSession(sessionId);
        await this.userService.deleteUserSession(req.body.id);
        res.send();
    }
    changePasswordAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.OK).json({errors: errors.array()});
        }

        const email = req.body.user_email;
        const confirmationEmail = req.body.confirmation_email;
        const userObject = await this.userService.getUserByEmail(email);

        if (!userObject) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        const user = userObject.dataValues;

        if (!user.isConfirm) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const changePasswordTokenObject = await this.authorizeService.createChangePasswordToken(user, `${process.env.JWT_VERIFY_LIFETIME}`);
        const token = changePasswordTokenObject.dataValues.tokenname;


        if (!token) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        await this.mailerService.sendPasswordConfirmation(confirmationEmail, token);

        res.status(HttpStatus.OK).send();
    }
    updatePasswordAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const token = req.query.token;
        const isValid = this.authorizeService.verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isConfirmToken = await this.authorizeService.getChangePasswordToken(token);

        if (!isConfirmToken) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userId = isConfirmToken.dataValues.userId;

        const salt = this.passwordHelper.generateSalt();
        const password = this.passwordHelper.generateHash(salt, req.body.newPassword);
        await this.userService.updateUserPassword(userId, password, salt);

        this.authorizeService.deleteChangePasswordToken(token);

        res.status(HttpStatus.OK).send('Password has been updated');
    }
    refreshTokensAccount = async (req, res) => {
        const token = req.body.refreshToken;
        const refreshTokenObject = await this.authorizeService.getRefreshToken(token);

        if (!refreshTokenObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userID = refreshTokenObject.dataValues.userId;
        const userObject = await this.userService.getUserWithID(userID);

        if (!userObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const sessionDataObject = await this.authorizeService.getSessionData(userID);
        const sessionID = sessionDataObject.dataValues.id;


        const user = userObject.dataValues;
        const refreshToken = await this.authorizeService.updateRefreshToken(user, req.body.refreshToken);
        const accessToken = await this.authorizeService.updateAccessToken(sessionID, user, '1h');
        const tokens = {
            accessToken,
            refreshToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
}
