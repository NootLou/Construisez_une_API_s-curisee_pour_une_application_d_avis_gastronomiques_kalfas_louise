const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
<<<<<<< HEAD
        const decodedToken = jwt.verify(token,`${ process.env.SECRET_TOKEN}`);
=======
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN);
>>>>>>> 168ff06bc8dfa5dbc85dec3e6fe51880f2f2f0aa
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};