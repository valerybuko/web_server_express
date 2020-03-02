import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import {checkCorrectAccessToken, REFRESH_TOKEN_SECRET} from "../services/auth-service";


export default () => async (req, res, next) => {
    const userData = jwtDecode(req.headers.authorization);
    const user = userData.user;
    req.userId = user.id;
    let decoded = jwt.decode(req.headers.authorization);
    console.log('=========afs', decoded);

    const checking = await checkCorrectAccessToken(req.userId, req.headers.authorization);

    if (!req.headers.authorization || !checking) {
        return next(res.send(HttpStatus.UNAUTHORIZED));
    }

    next();
}
