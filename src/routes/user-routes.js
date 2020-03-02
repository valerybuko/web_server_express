import express from 'express';
import HttpStatus from 'http-status-codes';
import {
    deleteUser,
    getAllUsers,
    getUserByEmail, getUserRoleByUserId,
    getUserWithID,
    updateUser
} from "../services/user-service";
import badRequestErrorHandler from '../middleware/BadRequestErrorHandler';
import authorize from '../middleware/Authorization';

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

module.exports = () => {
    router.get('/users',
        badRequestErrorHandler(async (req, res) => {
            const allUsers = await getAllUsers();

            if (!allUsers.length) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }

            res.status(HttpStatus.OK).send(allUsers);
        })
    );

    router.get('/user',
        badRequestErrorHandler(async (req, res) => {
            const user = await getUserWithID(req.query.id);

            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }

            res.status(HttpStatus.OK).send(user);
        })
    );

    router.get('/email',
        badRequestErrorHandler(async (req, res) => {
            const user = await getUserByEmail(req.body.email);

            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).send();
            }

            res.status(HttpStatus.OK).send(user);
        })
    );

    router.put('/user', [
            check('email').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ],
        authorize(),
        badRequestErrorHandler(async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
            }

            const userId = req.userId;
            const userRoleObject = await getUserRoleByUserId(userId);
            const role = userRoleObject.dataValues.role;

            if (role === 'admin') {
                await updateUser(req.body.id, req.body);
            }

            else {
                if (req.body.id) {
                    return res.status(HttpStatus.FORBIDDEN).send();
                }
                await updateUser(userId, req.body);
            }

            res.status(HttpStatus.OK).send();
        })
    );

    router.delete('/user',
        badRequestErrorHandler(async (req, res) => {
            await deleteUser(req.query.id);

            res.status(HttpStatus.OK).send();
        })
    );

    return router;
}
