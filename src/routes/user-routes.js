import express from 'express';
import HttpStatus from 'http-status-codes';
import {
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserWithID,
    updateUser
} from "../services/user-service";

const router = express.Router();
const { check, validationResult } = require('express-validator/check');

module.exports = () => {
    router.get('/users', async (req, res) => {
        const allUsers = await getAllUsers().catch(err => res.status(HttpStatus.BAD_REQUEST).send());

        if (!allUsers.length) {
             return res.status(HttpStatus.NOT_FOUND).send();
        }

        return res.status(HttpStatus.OK).send(allUsers);
    });

    router.get('/user', async (req, res) => {
        const user = await getUserWithID(req.query.id).catch(err => res.status(HttpStatus.BAD_REQUEST).send());

        if(!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        return res.status(HttpStatus.OK).send(user);
    });

    router.get('/email', async (req, res) => {
        const user = await getUserByEmail(req.body.email).catch(err => res.status(HttpStatus.BAD_REQUEST).send());

        if(!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        return res.status(HttpStatus.OK).send(user);
    });

    router.put('/user', [
        check('email').normalizeEmail().isEmail(),
        check('password', 'Enter a password with five or more characters').isLength({min: 5})
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        } else {
            const result = await updateUser(req.body).catch(err => console.log(err));
            return res.status(HttpStatus.CREATED).send(result);
        }
    });

    router.delete('/user', async (req, res) => {
        await deleteUser(req.query.id).catch(err => res.send(HttpStatus.BAD_REQUEST));
        return res.status(HttpStatus.OK).send();
    });

    return router;
}
