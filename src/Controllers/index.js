import express from 'express';
//import accountRouter from './account-Controllers';
import AccountController from "./AccountController";
import UserController from "./UserController";
import AdminController from "./AdminController";
import userRouter from './UserController';
import adminRoutes from './AdminController'

const router = express.Router();

const accountController = new AccountController();
const userController = new UserController();
const adminController = new AdminController();

router.use('/', accountController.router);
router.use('/', userController.router);
router.use('/', adminController.router);
/*router.use('/', userRouter());
router.use('/', adminRoutes());*/

export default router;
