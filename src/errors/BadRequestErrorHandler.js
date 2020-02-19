export default (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
        if (!error.isBoom) {
            return next(res.boom.badRequest(error))
        }
        next(error);
    })
}
