import express, { Request, Response, Router } from 'express';
import HttpStatus from 'http-status-codes';
import { inject, injectable } from "inversify";
import types from "../Ioc/types";
import IUserService from "../Domain/Interfaces/IUserService";
import { IPasswordService } from "../Domain";
import PromiseMiddleware from "../Middlewares/PromiseMiddleware";
import AuthorizationMiddleware from "../Middlewares/AuthorizationMiddleware";
import UserEntity from "../Domain/Entities/UserEntity";

const router = express.Router();
const { check, validationResult } = require('express-validator/check');

@injectable()
export default class UserController {
    router: Router;
    userService: IUserService;
    passwordService: IPasswordService;

    constructor(@inject(types.UserService) userService: IUserService,
                @inject(types.PasswordService) passwordService: IPasswordService) {
        this.router = express.Router();
        this.initializeRoutes();
        this.userService = userService;
        this.passwordService = passwordService;
    }

    private checkValidation = () => {
        const checkingArray = [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
            check('password', 'Enter a password with five or more characters').isLength({min: 5})
        ];
        return checkingArray;
    }

    private checkEmail = () => {
        const checkingArray = [
            check('email', 'Wrong email address').normalizeEmail().isEmail(),
        ];
        return checkingArray;
    }

    private initializeRoutes = () => {
        const path = '/api/users';

        this.router.get(path, this.checkValidation(), PromiseMiddleware(this.getUsers));
        this.router.get(`${path}/user`, PromiseMiddleware(this.getUser));
        this.router.get(`${path}/email`, this.checkEmail(), PromiseMiddleware(this.getEmail));
        this.router.put(`${path}/user`, this.checkValidation(), AuthorizationMiddleware(), PromiseMiddleware(this.updateUser));
        this.router.delete(`${path}/user`, PromiseMiddleware(this.deleteUser));

        return router;
    }

    getUsers = async (req: Request, res: Response): Promise<any> => {
        const allUsers: object | undefined = await this.userService.getAllUsers();

        if (!allUsers.length) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(allUsers);
    }

    getUser = async (req: Request, res: Response): Promise<any> => {
        const user = await this.userService.getUserWithID(req.query.id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    getEmail = async (req: Request, res: Response): Promise<any> => {
        const user = await this.userService.getUserByEmail(req.body.email);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        res.status(HttpStatus.OK).send(user);
    }

    updateUser = async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
        }

        const userId = req.query.id;
        const userRoleObject = await this.userService.getUserRoleByUserId(userId);

        if(!userRoleObject) {
            return res.status(HttpStatus.BAD_REQUEST).send();
        }

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

    deleteUser = async (req: Request, res: Response) => {
        await this.userService.deleteUser(req.query.id);

        res.status(HttpStatus.OK).send();
    }
}
