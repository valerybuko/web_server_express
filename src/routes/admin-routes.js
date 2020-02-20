import express from 'express';
import HttpStatus from 'http-status-codes';
import badRequestErrorHandler from "../errors/BadRequestErrorHandler";

const router = express.Router();
const { check, validationResult } = require('express-validator/check');

module.exports = () => {
    router.post('/change-user-role',
        badRequestErrorHandler(async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(HttpStatus.BAD_REQUEST).json({errors: errors.array()});
            }


           /* const { userrole, username, email, salt, city, birthdate, confirmation_email } = req.body;

            if (!username || !salt || !userrole || !city || !birthdate) {
                return res.status(HttpStatus.BAD_REQUEST).send();
            }

            const appuser = await getUserByEmail(email);*/

            if (appuser) {
                return res.status(HttpStatus.CONFLICT).send();
            }



            res.status(HttpStatus.OK).send(createUserSuccessfulParams);
        })
    );

    return router;
}
