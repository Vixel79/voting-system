// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Something went wrong. Please try again.' : err.message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Not found.' });
}

module.exports = { errorHandler, notFoundHandler };
