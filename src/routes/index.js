import express from 'express';
import accountRouter from './account-routes';
import userRouter from './user-routes';
import adminRoutes from './admin-routes'

const router = express.Router();

router.use('/', accountRouter());
router.use('/', userRouter());
router.use('/', adminRoutes());

export default router;
