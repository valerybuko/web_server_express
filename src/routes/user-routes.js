import express from 'express';
import jwt from 'jsonwebtoken';
import {
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserWithID,
    updateUser,
    updateUserPassword
} from "../services/user-service";
import { getVerificationToken, REFRESH_TOKEN_SECRET } from "../services/auth-service";
import { sendPasswordConfirmation } from "../services/mailer-service";

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

module.exports = () => {
    router.post('/changepass', async (req, res) => {
        const token = req.body.verificationToken;

        const isValid = jwt.verify(token, REFRESH_TOKEN_SECRET, (err) => {
            if (err) {
                return res.status(403).send();
            } else {
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

        const useremail = 'valery.buka@itechart-group.com ';
        await sendPasswordConfirmation(useremail).catch((err) => res.status(400).send());

        return res.status(200).send();
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
            } else {
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

        res.status(200).send();
    });
    router.get('/users', async (req, res) => {
        const allUsers = await getAllUsers().catch(err => res.status(400).send());

        if (!allUsers.length) {
             return res.status(404).send();
        }

        return res.status(200).send(allUsers);
    });

    router.get('/user', async (req, res) => {
        const user = await getUserWithID(req.query.id).catch(err => res.status(400).send());

        if(!user) {
            return res.status(404).send();
        }

        return res.status(200).send(user);
    });

    router.get('/email', async (req, res) => {
        const user = await getUserByEmail(req.body.email).catch(err => res.status(400).send());

        if(!user) {
            return res.status(404).send();
        }

        return res.status(200).send(user);
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
            return res.status(201).send(result);
        }
    });

    router.delete('/user', async (req, res) => {
        await deleteUser(req.query.id).catch(err => res.send(400));
        return res.status(200).send();
    });

    return router;
}