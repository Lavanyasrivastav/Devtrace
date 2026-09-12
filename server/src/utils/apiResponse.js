export function success(res, { statusCode = 200, message = 'Success', data = {} } = {}) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function fail(res, { statusCode = 500, message = 'Something went wrong', errors = [], ...extra } = {}) {
  return res.status(statusCode).json({ success: false, message, errors, ...extra });
}
