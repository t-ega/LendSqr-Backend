"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const IsAuthenticated = (req, res, next) => {
    /**
     * Note: This middleware is a faux authentication middleware, it just checks if there is an authorization
     * header with a Bearer token supplied.
     * The value of the authorization header may look like this:
     * Bearer 2 // indicating the user making the request has an ID of 2
     */
    const token = extractTokenFromHeader(req);
    if (!token)
        return res
            .status(401)
            .send({ success: false, details: "No auth token provided" });
    // try the token sent by the user
    req.userId = token;
    next();
};
function extractTokenFromHeader(request) {
    var _a, _b;
    const [type, token] = (_b = (_a = request.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')) !== null && _b !== void 0 ? _b : [];
    return type === 'Bearer' ? token : undefined;
}
exports.default = IsAuthenticated;
