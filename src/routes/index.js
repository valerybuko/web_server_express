import express from 'express';
//import accountRouter from './account-routes';
import AccountController from "./account-routes";
import userRouter from './user-routes';
import adminRoutes from './admin-routes'

const router = express.Router();
const accountController = new AccountController();

router.use('/', accountController.router);
/*router.use('/', userRouter());
router.use('/', adminRoutes());*/

export default router;
