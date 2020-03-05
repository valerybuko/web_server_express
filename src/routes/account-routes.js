import express from 'express';
import HttpStatus from 'http-status-codes';
import {
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
import {sendPasswordConfirmation, sendUserConfirmation} from "../services/mailer-service";
import badRequestErrorHandler from "../middleware/BadRequestErrorHandler";
import authorize from '../middleware/Authorization';
import jwtDecode from 'jwt-decode';

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

export default class AccountController {
    router;

    constructor() {
        this.router = express.Router();
        this.initializeRoutes();
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
        this.router.post(`${path}/changepass`, this.checkEmailBeforePasswordReset(), this.checkPasswordAccount);
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

        const appuser = await getUserByEmail(email);

        if (appuser) {
            return res.status(HttpStatus.CONFLICT).send();
        }

        const newUser = await addNewUser(req.body);
        const newUserId = newUser.dataValues.id;
        const userRole = await createUserRole(userrole, newUserId);
        const confirmationToken = await createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`);

        //await sendUserConfirmation(confirmation_email, confirmationToken.tokenname);

        res.status(HttpStatus.CREATED).send();
    }
    confirmAccount = async (req, res) => {
        const token = req.query.token;

        const userObject = await getConfirmationToken(token);

        if (!userObject) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const userId = userObject.dataValues.userId;

        await confirmUser(userId);

        await deleteConfirmationToken(token);

        res.status(HttpStatus.OK).send();
    }
    loginAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.UNAUTHORIZED).json({errors: errors.array()});
        }

        const passwordCheck = new CorrectPasswordCheck();

        const {email, password} = req.body;
        const appuserObject = await getUserByEmail(email);

        if (!appuserObject) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const appuser = appuserObject.dataValues;
        const isUserConfirm = appuser.isConfirm;

        if (!isUserConfirm) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isCorrectPassword = passwordCheck.comparePassword(password, appuser.salt, appuser.password);
        if (!isCorrectPassword) {
            res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const refreshToken = await createRefreshToken(appuser, `${process.env.JWT_REFRESH_LIFETIME}`);
        const userSessionNumber = refreshToken.dataValues.id;

        const accessToken = await saveSessionToRedis(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, userSessionNumber);

        const tokens = {
            refreshToken: refreshToken.tokenname,
            accessToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
    logoutAccount = async (req, res) => {
        const sessionDataObject = await getSessionData(req.body.id);
        const sessionId = sessionDataObject.dataValues.id;
        await deleteSession(req.body.id, sessionId);
        res.send();
    }
    checkPasswordAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.OK).json({errors: errors.array()});
        }

        const email = req.body.user_email;
        const confirmationEmail = req.body.confirmation_email;
        const userObject = await getUserByEmail(email);

        if (!userObject) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        const user = userObject.dataValues;

        if (!user.isConfirm) {
            return res.status(HttpStatus.UNAUTHORIZED).send();
        }

        const changePasswordTokenObject = await createChangePasswordToken(user, `${process.env.JWT_VERIFY_LIFETIME}`);
        const token = changePasswordTokenObject.dataValues.tokenname;


        if (!token) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        //await sendPasswordConfirmation(confirmationEmail, token);

        res.status(HttpStatus.OK).send();
    }
    updatePasswordAccount = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const token = req.query.token;
        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(HttpStatus.FORBIDDEN).send();
        }

        const isConfirmToken = await getChangePasswordToken(token);

        if (!isConfirmToken) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userId = isConfirmToken.dataValues.userId;

        await updateUserPassword(userId, req.body.newPassword);

        deleteChangePasswordToken(token);

        res.status(HttpStatus.OK).send('Password has been updated');
    }
    refreshTokensAccount = async (req, res) => {
        const token = req.body.refreshToken;
        const refreshTokenObject = await getRefreshToken(token);

        if (!refreshTokenObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const userID = refreshTokenObject.dataValues.userId;
        const userObject = await getUserWithID(userID);

        if (!userObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

        const sessionDataObject = await getSessionData(userID);
        const sessionID = sessionDataObject.dataValues.id;


        const user = userObject.dataValues;
        const refreshToken = await updateRefreshToken(user, req.body.refreshToken);
        const accessToken = await updateAccessToken(sessionID, user, '1h');
        const tokens = {
            accessToken,
            refreshToken
        }

        res.status(HttpStatus.OK).send(tokens);
    }
}
