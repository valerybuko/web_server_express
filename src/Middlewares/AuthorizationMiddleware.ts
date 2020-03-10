import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import RedisRepository from "../Dal/Redis/Repository";


export default () => async (req, res, next) => {
    const redisRepository = new RedisRepository();
    const userData = jwt.decode(req.headers.authorization);
    const user = userData.user;
    req.userId = user.id;

    const checking = await redisRepository.checkCorrectAccessToken(req.userId, req.headers.authorization);

    if (!req.headers.authorization || !checking) {
        return next(res.send(HttpStatus.UNAUTHORIZED));
    }

    next();
}
