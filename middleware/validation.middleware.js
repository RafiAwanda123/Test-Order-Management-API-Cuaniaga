const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));
      
      return res.status(400).json({
        status: 'error',
        errors
      });
    }
    
    next();
  };
};

module.exports = validate;