/**
 * Async Handler Wrapper
 * Eliminates try-catch boilerplate in every controller
 * Usage: router.get('/', catchAsync(controllerFn))
 */

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;