import express from 'express';
import HttpStatus from 'http-status-codes';
import badRequestErrorHandler from "../errors/BadRequestErrorHandler";
import { changedUserRole } from '../services/user-service';

const router = express.Router();

module.exports = () => {
    router.put('/change/userrole',
        badRequestErrorHandler(async (req, res) => {
            const { userrole, id } = req.body;

            await changedUserRole(userrole, id).catch(err => console.log(err));

            res.status(HttpStatus.OK).send();
        })
    );

    return router;
}
