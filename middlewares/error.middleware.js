"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    res
        .status(500)
        .send({ success: false, details: "An error occured on the server", errorTrace: err.message });
    // TODO: Perform logging of the error to a database instead of sending it back to the user
}
;
exports.default = errorHandler;
