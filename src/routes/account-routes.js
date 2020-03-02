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
    deleteChangePasswordToken, deleteSession
} from "../services/auth-service";

import {comparePassword} from "../passwordHelper";
import {sendPasswordConfirmation, sendUserConfirmation} from "../services/mailer-service";
import badRequestErrorHandler from "../middleware/BadRequestErrorHandler";
import authorize from '../middleware/Authorization';
import jwtDecode from 'jwt-decode';

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

module.exports = () => {
    router.post('/create-user', [
            check('email').normalizeEmail().isEmail(),
            check('confirmation_email').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ],
        badRequestErrorHandler(async (req, res) => {
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
        })
    );

    router.put('/confirm',
        badRequestErrorHandler(async (req, res) => {
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
        })
    );

    router.post('/login', [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ],
        badRequestErrorHandler(async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(HttpStatus.UNAUTHORIZED).json({errors: errors.array()});
            }

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

            const isCorrectPassword = comparePassword(password, appuser.salt, appuser.password);
            if (!isCorrectPassword) {
                res.status(HttpStatus.UNAUTHORIZED).send();
            }

            const refreshToken = await createRefreshToken(appuser, `${process.env.JWT_REFRESH_LIFETIME}`);
            const userSessionNumber = refreshToken.dataValues.id;

            const userId = refreshToken.dataValues.id;
            const accessToken = await saveSessionToRedis(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, userSessionNumber);

            const tokens = {
                refreshToken: refreshToken.tokenname,
                accessToken
            }

            res.status(HttpStatus.OK).send(tokens);
        })
    );

    router.post('/logout',
        authorize(),
        badRequestErrorHandler(async (req, res) => {
            await deleteSession(req.body.id, req.headers.authorization);
            res.send();
        })
    )

    router.post('/changepass', [
            check('user_email', 'Wrong email address').normalizeEmail().isEmail(),
            check('confirmation_email', 'Wrong email address').normalizeEmail().isEmail()
        ], badRequestErrorHandler(async (req, res) => {
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

            const newtoken = {
                changePasswordToken: token
            }

            await sendPasswordConfirmation(confirmationEmail);

            res.status(HttpStatus.OK).send(newtoken);
        })
    );

    router.put('/updatepass', [
            check('newPassword', 'Enter a password with five or more characters').isLength({min: 5})
        ], badRequestErrorHandler(async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
            }

            const token = req.body.changePasswordToken;
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
        })
    );

    router.put('/refresh/tokens',
        badRequestErrorHandler(async (req, res) => {
            const token = req.body.refreshToken;
            const refreshTokenObject = await getRefreshToken(token);

            if (!refreshTokenObject) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }

            const userId = refreshTokenObject.dataValues.userId;
            const userObject = await getUserWithID(userId);

            if (!userObject) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }


            const user = userObject.dataValues;
            const refreshToken = await updateRefreshToken(user, req.body.refreshToken).catch(err => res.status(HttpStatus.BAD_REQUEST).send());
            const accessToken = await updateAccessToken(user, '1h').catch(err => res.status(HttpStatus.BAD_REQUEST).send());
            const tokens = {
                accessToken,
                refreshToken
            }

            res.status(HttpStatus.OK).send(tokens);
        })
    );

    return router;
}
