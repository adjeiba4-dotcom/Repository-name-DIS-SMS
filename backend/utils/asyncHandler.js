/**
 * Express async handler wrapper to catch errors in async route handlers
 * and pass them to the express error handler middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = asyncHandler;