import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { checkCorrectAccessToken } from "../services/auth-service";


export default () => async (req, res, next) => {
    const userData = jwt.decode(req.headers.authorization);
    const user = userData.user;
    req.userId = user.id;
    console.log('decoded token data', userData);

    const checking = await checkCorrectAccessToken(req.userId, req.headers.authorization);

    if (!req.headers.authorization || !checking) {
        return next(res.send(HttpStatus.UNAUTHORIZED));
    }

    next();
}
