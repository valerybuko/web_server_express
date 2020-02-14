import express from 'express';
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
