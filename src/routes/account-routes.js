import express from 'express';
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

import { comparePassword } from "../passwordHelper";
import {sendPasswordConfirmation, sendUserConfirmation} from "../services/mailer-service";

const router = express.Router();
const { check, validationResult } = require('express-validator/check');

module.exports = () => {
    router.post('/create-user', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email} = req.body;
        let appuser = await getUserByEmail(email);

        if (appuser) {
            res.status(409).send();
        }

        const newUser = await addNewUser(req.body).catch(err => res.status(400).send());

        const confirmationToken = await createConfirmationToken(newUser, `${process.env.JWT_VERIFY_LIFETIME}`).catch(err => res.status(400).send());

        const createUserSuccessfulParams = {
            newUser,
            confirmationToken
        }

        const useremail = req.body.confirmation_email;

        //await sendUserConfirmation(useremail).catch(err => res.status(400).send());

        res.status(200).send(createUserSuccessfulParams);
    });

    router.post('/confirm', async (req, res) => {

        const token = req.body.confirmationToken;
        const userObject = await getConfirmationToken(token);

        if(!userObject) {
            return res.status(403).send();
        }

        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

        if(!isValid) {
            return res.status(403).send();
        }

        const userId = userObject.dataValues.userId;

        await confirmUser(userId);

        await deleteConfirmationToken(token);

        res.status(200).send();
    });

    router.post('/login', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(401).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        const appuserObject = await getUserByEmail(email);

        if(!appuserObject) {
            return res.status(401).send();
        }

        const appuser = appuserObject.dataValues;
        const isUserConfirm = appuser.isConfirm;

        if(!isUserConfirm) {
            return res.status(403).send();
        }

        const isCorrectPassword = comparePassword(password, appuser.salt, appuser.password);
        if (!isCorrectPassword) {
            res.status(401).send();
        }
        const refreshToken = await createRefreshToken(appuser, `${process.env.JWT_REFRESH_LIFETIME}`).catch(err => res.status(400).send());
        const index = refreshToken.dataValues.id;

        const accessToken = await createAccessToken(appuser, `${process.env.JWT_ACCESS_LIFETIME}`, index).catch(err => res.status(400).send());

        const tokens = {
            refreshToken: refreshToken.tokenname,
            accessToken
        }

        res.status(200).send(tokens);
    });

    router.post('/changepass', async (req, res) => {
        const email = req.body.user_email;
        const confirmationEmail = req.body.confirmation_email;
        const userObject = await getUserByEmail(email);

        if(!userObject) {
            return res.status(404).send();
        }

        const user = userObject.dataValues;

        if (!user.isConfirm) {
            return res.status(401).send();
        }

        const changePasswordTokenObject = await createChangePasswordToken(user, `${process.env.JWT_VERIFY_LIFETIME}`).catch(err => res.status(400).send());
        const token = changePasswordTokenObject.dataValues.tokenname;


        if (!token) {
            return res.status(403).send();
        }

        const newtoken = {
            changePasswordToken: token
        }

        //await sendPasswordConfirmation(confirmationEmail).catch((err) => res.status(400).send());

        res.status(200).send(newtoken);
    });

    router.put('/updatepass', [
        check('newPassword', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const token = req.body.changePasswordToken;

        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(403).send();
        }

        const isConfirmToken = await getChangePasswordToken(token);

        if(!isConfirmToken) {
            return res.status(400).send();
        }

        const userId = isConfirmToken.dataValues.userId;

        await updateUserPassword(userId, req.body.newPassword);

        deleteChangePasswordToken(token);

        res.status(200).send('Password has been updated');
    });

    router.put('/refresh/tokens', async (req, res) => {
        const token = req.body.refreshToken;
        const authorizationToken = req.headers.authorization;

        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);

        if (!isValid) {
            return res.status(403).send();
        }

        const refreshTokenObject = await getRefreshToken(token);

        if (!refreshTokenObject) {
            return res.status(401).send();
        }

        const userId = refreshTokenObject.dataValues.userId;
        const userObject = await getUserWithID(userId);

        if(!userObject) {
            return res.status(404).send();
        }


        const user = userObject.dataValues;
        const refreshToken = await updateRefreshToken(user, req.body.refreshToken).catch(err => res.status(400).send());
        const accessToken = await updateAccessToken(user, req.headers.authorization, '1h').catch(err => res.status(400).send());

        const tokens = {
            accessToken,
            refreshToken
        }

        res.status(200).send(tokens);
    });

    return router;
}
