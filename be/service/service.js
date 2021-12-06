//Template Error Handler

class Service {
    constructor() {}
  
    error(err) {
      return {
        success: false,
        err,
      };
    }
  
    success(result) {
      return {
        success: true,
        result,
      };
    }
  }
  
  module.exports = Service;
  