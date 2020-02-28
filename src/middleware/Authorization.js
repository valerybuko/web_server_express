export default () => (req, res, next) => {
    //console.log(req.headers.authorization);
    if (!req.headers.authorization) {
        return next(res.send(401))
    }

    next();
}
