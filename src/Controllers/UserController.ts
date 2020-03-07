import express, { Router } from 'express';
import HttpStatus from 'http-status-codes';
import UserService from "../Services/UserService";
import badRequestErrorHandler from '../Middlewares/PromiseMiddleware';
import authorize from '../Middlewares/AuthorizationMiddleware';
import PasswordService from "../Services/PasswordService";
import {inject, injectable} from "inversify";
import types from "../Ioc/types";
import IUserService from "../Domain/Interfaces/IUserService";
import {IPasswordService} from "../Domain";

const router = express.Router();
const {check, validationResult} = require('express-validator/check');

@injectable()
export default class UserController {
    router: Router;
    userService: any;
    passwordService: any;

    constructor(@inject(types.UserService) userService: IUserService, @inject(types.PasswordService) passwordService: IPasswordService) {
        this.router = express.Router();
        this.initializeRoutes();
        this.userService = userService;
        this.passwordService = passwordService;
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

    getUsers = async (req: any, res: any) => {
        const allUsers = await this.userService.getAllUsers();

        if (!allUsers.length) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(allUsers);
    }

    getUser = async (req: any, res: any) => {
        const user = await this.userService.getUserWithID(req.query.id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    getEmail = async (req: any, res: any) => {
        const user = await this.userService.getUserByEmail(req.body.email);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    updateUser = async (req: any, res: any) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const userId = req.query.id;
        const userRoleObject = await this.userService.getUserRoleByUserId(userId);
        const role = userRoleObject.dataValues.role;

        if (role === 'admin') {
            const salt = this.passwordService.generateSalt();
            const password = this.passwordService.generateHash(req.body.password, salt);
            await this.userService.updateUser(req.body.id, req.body, salt, password);
        }

        else {
            if (req.body.id) {
                return res.status(HttpStatus.FORBIDDEN).send();
            }
            const salt = this.passwordService.generateSalt();
            const password = this.passwordService.generateHash(req.body.password, salt);
            await this.userService.updateUser(userId, req.body, salt, password);
        }

        res.status(HttpStatus.OK).send();
    }

    deleteUser = async (req: any, res: any) => {
        await this.userService.deleteUser(req.query.id);

        res.status(HttpStatus.OK).send();
    }
}
