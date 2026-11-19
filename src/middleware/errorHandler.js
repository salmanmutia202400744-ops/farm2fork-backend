function notFound(req, res) {
    res.status(404).json({
      success: false,
      message: "API route not found"
    });
  }
  
  function errorHandler(err, req, res, next) {
    console.error(err);
  
    res.status(err.status || 500).json({
      success: false,
      message:
        err.status && err.status < 500
          ? err.message
          : "Internal server error"
    });
  }
  
  module.exports = {
    notFound,
    errorHandler
  };