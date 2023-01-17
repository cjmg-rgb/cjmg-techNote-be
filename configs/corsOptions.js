const allowedOrigins = require('./allowedOrigins');

const corsOrigins = {
  origin: (origin, callback) => {
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error(`Not Allowed by CORS`))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

module.exports = corsOrigins;