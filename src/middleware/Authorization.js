import { checkCorrectAccessToken } from "../services/auth-service";
import HttpStatus from 'http-status-codes';

export default () => async (req, res, next) => {
    const checking = await checkCorrectAccessToken(req.body.id, req.headers.authorization);
    console.log(checking);

    if (!req.headers.authorization || !checking) {
        return next(res.send(HttpStatus.NOT_FOUND));
    }

    next();
}
