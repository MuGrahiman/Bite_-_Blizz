/**
 * View Helper Middleware
 * Attaches view name to request for validation re-rendering
 */

const setView = (viewName) => (req, res, next) => {
  req.viewName = viewName;
  next();
};

module.exports = { setView };