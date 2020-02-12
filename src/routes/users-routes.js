import express from 'express';
import {
    addNewUser,
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserWithID,
    updateUser,
    createVerificationToken,
    confirmUser, updateUserPassword
} from "../services/user-service";
import {
    createRefreshToken,
    createAccessToken,
    REFRESH_TOKEN_SECRET,
    updateRefreshToken,
    updateAccessToken,
    getRefreshToken,
    getVerificationToken
} from "../services/auth-service";

import { comparePassword } from "../passwordHelper";
import { sendPasswordConfirmation, sendUserConfirmation } from "../services/mailer-service";

const router = express.Router();
const jwt = require('jsonwebtoken');
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

        const useremail = 'valery.buka@itechart-group.com ';

        await sendUserConfirmation(useremail).catch(err => res.status(400).send(503));

        res.send(createUserSuccessfulParams);
    });

    router.post('/confirm', async (req, res) => {

        const token = req.body.token;

        const userObject = await getVerificationToken(token).catch(err => res.status(403).send());

        if (!userObject) {
            return res.status(403).send();
        }

        const userId = userObject.dataValues.userId;

        await confirmUser(userId).catch(err => res.status(400).send());

        res.send();
    });

    router.post('/changepass', async (req, res) => {
        const token = req.body.verificationToken;

        const isValid = jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
            if (err) {
                return res.status(403).send();
            }
            else {
                return true
            }
        });

        if (isValid.exp < 10) {
            res.status(403).send();
        }

        const isConfirmToken = await getVerificationToken(token);

        if (!isConfirmToken) {
            return  res.status(400).send();
        }

        const useremail = 'valery.buka@itechart-group.com ';
        await sendPasswordConfirmation(useremail).catch((err) => res.status(400).send());

        return res.send();
    });

    router.put('/updatepass', [
        check('newPassword', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const token = req.body.verificationToken;

        const isValid = jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
            if (err) {
                return res.status(403).send();
            }
            else {
                return true
            }
        });

        if (isValid.exp < 10) {
            res.status(403).send();
        }

        const isConfirmToken = await getVerificationToken(token);

        if (!isConfirmToken) {
            return res.status(400).send();
        }

        const userId = isConfirmToken.dataValues.userId;

        await updateUserPassword(userId, req.body.newPassword);

        res.send();
    });

    router.put('/refresh/tokens', async (req, res) => {

        if (!req.body.refreshToken) {
            res.status(400).send();
        }

        const isValid = jwt.verify(req.body.refreshToken, REFRESH_TOKEN_SECRET);

        if (isValid.exp < 10) {
            res.status(403).send();
        }

        const refreshTokenObject = await getRefreshToken(req.body.refreshToken).catch(err => res.status(400).send());

        if (!refreshTokenObject) {
            res.status(401).send();
        }

        const userId = refreshTokenObject.dataValues.userId;
        const userObject = await getUserWithID(userId).catch(err => res.status(404).send());
        const user = userObject.dataValues;
        const refreshToken = await updateRefreshToken(user, req.body.refreshToken).catch(err => res.status(400).send());
        const accessToken = await updateAccessToken(user, req.headers.authorization, '1h').catch(err => res.status(400).send());

        const tokens = {
            accessToken,
            refreshToken
        }

        res.status(200).send(tokens);
    });

    router.get('/users', async (req, res) => {
        const allUsers = await getAllUsers().catch(err => res.status(400).send());
        return res.send(allUsers);
    });

    router.get('/user', async (req, res) => {
        const user = await getUserWithID(req.query.id).catch(err => res.status(400).send());
        return res.send(user);
    });

    router.get('/email', async (req, res) => {
        const user = await getUserByEmail(req.body.email).catch(err => res.status(400).send());
        return res.send(user);
    });

    router.put('/user', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        } else {
            const result = await updateUser(req.body).catch(err => console.log(err));
            return res.send(result);
        }
    });

    router.delete('/user', async (req, res) => {
        await deleteUser(req.query.id).catch(err => res.send(400));
        return res.send();
    });

    router.post('/login', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;
        let appuserObject = await getUserByEmail(email).catch(err => res.status(400).send());
        let appuser = appuserObject.dataValues;

        if (!appuser) {
            return res.status(401).send();
        }

        if (!appuser.isConfirm) {
            return res.status(403).send();
        }

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

        res.send(tokens);
    });

    return router;
}
