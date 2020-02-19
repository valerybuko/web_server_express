import express from 'express';
import HttpStatus from 'http-status-codes';
import {
    addNewUser,
    getUserByEmail,
    getUserWithID,
    confirmUser,
    updateUserPassword
} from "../services/user-service";
import {
    createRefreshToken,
    createAccessToken,
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
    deleteChangePasswordToken
} from "../services/auth-service";

import {comparePassword} from "../passwordHelper";
import {sendPasswordConfirmation, sendUserConfirmation} from "../services/mailer-service";
import badRequestErrorHandler from "../errors/BadRequestErrorHandler";

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

module.exports = () => {
    router.post('/create-user', [
            check('email').normalizeEmail().isEmail(),
            check('confirmation_email').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ],
        badRequestErrorHandler(async (req, res) => {
            /*check('email').normalizeEmail().isEmail();
            check('confirmation_email').normalizeEmail().isEmail();
            check('password', 'Enter a password with five or more characters').isLength({min: 5});*/

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
            }

            const {username, email, salt, role, city, birthdate, confirmation_email} = req.body;

            if (!username || !salt || !role || !city || !birthdate) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }

            let appuser = await getUserByEmail(email);

            if (appuser) {
                return res.status(HttpStatus.CONFLICT).send();
            }

            const newUser = await addNewUser(req.body);

            const confirmationToken = await createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`);

            const createUserSuccessfulParams = {
                newUser,
                confirmationToken
            }


            await sendUserConfirmation(confirmation_email)

            res.status(HttpStatus.OK).send(createUserSuccessfulParams);
        })
    );

    router.post('/confirm',
        badRequestErrorHandler(async (req, res) => {
            const token = req.body.confirmationToken;
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
            const index = refreshToken.dataValues.id;
            const accessToken = await createAccessToken(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, index);

            const tokens = {
                refreshToken: refreshToken.tokenname,
                accessToken
            }

            res.status(HttpStatus.OK).send(tokens);
        })
    );

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
            const authorizationToken = req.headers.authorization;

            const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

            if (!isValid) {
                return res.status(HttpStatus.FORBIDDEN).send();
            }

            const refreshTokenObject = await getRefreshToken(token);

            if (!refreshTokenObject) {
                return res.status(HttpStatus.UNAUTHORIZED).send();
            }

            const userId = refreshTokenObject.dataValues.userId;
            const userObject = await getUserWithID(userId);

            if (!userObject) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }


            const user = userObject.dataValues;
            const refreshToken = await updateRefreshToken(user, req.body.refreshToken).catch(err => res.status(HttpStatus.BAD_REQUEST).send());
            const accessToken = await updateAccessToken(user, req.headers.authorization, '1h').catch(err => res.status(HttpStatus.BAD_REQUEST).send());
            const tokens = {
                accessToken,
                refreshToken
            }

            res.status(HttpStatus.OK).send(tokens);
        })
    );

    return router;
}
