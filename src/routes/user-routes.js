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

export default class UserController {
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

    checkEmail = () => {
        const checkingArray = [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
        ];
        return checkingArray;
    }

    initializeRoutes = () => {
        const path = '/api/users';

        this.router.get(path, this.checkValidation(), this.getUsers);
        this.router.get(`${path}/user`, this.getUser);
        this.router.get(`${path}/email`, this.checkEmail(), this.getEmail);
        this.router.put(`${path}/user`, this.checkValidation(), this.updateUser);
        this.router.delete(`${path}/user`, this.deleteUser);

        return router;
    }

    getUsers = async (req, res) => {
        const allUsers = await getAllUsers();

        if (!allUsers.length) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(allUsers);
    }

    getUser = async (req, res) => {
        const user = await getUserWithID(req.query.id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    getEmail = async (req, res) => {
        const user = await getUserByEmail(req.body.email);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    updateUser = async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const userId = req.query.id;
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
    }

    deleteUser = async (req, res) => {
        await deleteUser(req.query.id);

        res.status(HttpStatus.OK).send();
    }
}
