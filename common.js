const asyncHandler = (fn) =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next)
  }

const log = (...what) => {
  console.log(`[${new Date().toLocaleString()}] `, ...what)
}

module.exports = {
  asyncHandler,
  log
}

