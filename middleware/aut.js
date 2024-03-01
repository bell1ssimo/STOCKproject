const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function autToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        res.auth = false;
        return;
    }

    try {
        const decoded = jwt.verify(token, 'bellissimo');
        req.userId = decoded.userId;
        res.auth = true;

    const user = await User.findOne({ _id: decoded.userId  }, {isAdmin:1});
        if (user.isAdmin) {
            res.isAdmin = true; 
        } else {
            res.isAdmin = false; 
        }
    } catch (error) {
        res.auth = false;
    }
}

module.exports = autToken;
