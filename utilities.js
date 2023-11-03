const jwt = require('jsonwebtoken');
const util = require('util');
const verifyToken = util.promisify(jwt.verify);

const SocketConnectionAuthorize = function (token) {
    if (!token) {
        return false;
    }
    try {
        const decoded = verifyToken(token, process.env.ENCRYPTION_KEY);
        return decoded;
    } catch (err) {
        return false;
    }
};

module.exports = { SocketConnectionAuthorize };