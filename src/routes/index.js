import express from 'express';
import accountRouter from './account-routes';
import userRouter from './user-routes';

const router = express.Router();

router.use('/', accountRouter());
router.use('/', userRouter());

export default router;
