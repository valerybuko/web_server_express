import express from 'express';
import {
    addNewUser,
    getUserByEmail,
    getUserWithID,
    createVerificationToken,
    confirmUser,
} from "../services/user-service";
import {
    createRefreshToken,
    createAccessToken,
    REFRESH_TOKEN_SECRET,
    updateRefreshToken,
    updateAccessToken,
    getRefreshToken,
    getVerificationToken,
    verifyToken
} from "../services/auth-service";

import { comparePassword } from "../passwordHelper";
import { sendUserConfirmation } from "../services/mailer-service";

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
        const verificationToken = await createVerificationToken(newUser, '1d').catch(err => res.status(400).send());

        const createUserSuccessfulParams = {
            newUser,
            verificationToken
        }

        const useremail = req.body.confirmation_email;

        await sendUserConfirmation(useremail).catch(err => res.status(400).send(503));

        res.status(200).send(createUserSuccessfulParams);
    });

    router.post('/confirm', async (req, res) => {

        const token = req.body.token;

        const userObject = await getVerificationToken(token).catch(err => res.status(403).send());

        if (!userObject) {
            return res.status(403).send();
        }

        const userId = userObject.dataValues.userId;

        await confirmUser(userId).catch(err => res.status(400).send());

        res.status(200).send();
    });



    router.put('/refresh/tokens', async (req, res) => {
        const token = req.body.refreshToken;
        const isValid = verifyToken(token, REFRESH_TOKEN_SECRET);
        console.log('tokens validation', isValid);

        if (isValid.exp < 10) {
            return res.status(403).send();
        }

        const refreshTokenObject = await getRefreshToken(req.body.refreshToken).catch(err => res.status(400).send());

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



    router.post('/login', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(401).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        const appuserObject = await getUserByEmail(email)

        if(!appuserObject) {
            return res.status(401).send();
        }

        const appuser = appuserObject.dataValues;

        const isCorrectPassword = comparePassword(password, appuser.salt, appuser.password);
        if (!isCorrectPassword) {
            res.status(401).send();
        }
        const refreshToken = await createRefreshToken(appuser, '1d').catch(err => res.status(400).send());
        const accessToken = await createAccessToken(appuser, '1h').catch(err => res.status(400).send());

        const tokens = {
            refreshToken: refreshToken.tokenname,
            accessToken
        }

        res.status(200).send(tokens);
    });

    return router;
}
