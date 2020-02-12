import express from 'express';
import usersRouter from './users-routes';

const router = express.Router();

router.use('/', usersRouter());

export default router;
