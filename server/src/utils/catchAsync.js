// Wraps an async controller so rejected promises are forwarded to next(err)
// instead of crashing the process or requiring a try/catch in every controller.
export const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
