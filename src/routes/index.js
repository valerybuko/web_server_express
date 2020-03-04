import express from 'express';
//import accountRouter from './account-routes';
import AccountController from "./account-routes";
import UserController from "./user-routes";
import AdminController from "./admin-routes";
import userRouter from './user-routes';
import adminRoutes from './admin-routes'

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
