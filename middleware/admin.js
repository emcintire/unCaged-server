module.exports = function (req, res, next) {
    if (!req.user.isAdmin) return res.status(401).send("Ah ah ah! You didn't say the magic word!");
    next();
}