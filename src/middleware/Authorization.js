import { checkCorrectAccessToken } from "../services/auth-service";
import HttpStatus from 'http-status-codes';

export default () => async (req, res, next) => {
    console.log(req.body.id);
    console.log(req.headers.authorization);
    const checking = await checkCorrectAccessToken(req.body.id, req.headers.authorization);
    console.log(checking);
    if (!req.headers.authorization || !checking) {
        return next(res.send(HttpStatus.NOT_FOUND));
    }
    next();
}
