const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const logEvents = async (message, logFileName) => {

  const datetime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
  const log = `${datetime}\t${uuid()}\t${message}\n`;

  try {
    if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), log);
  } catch(err) {
    console.log(`Error: ${err.message}`);
  } 
}

const logger = (req, res, next) => {
  if(req.headers.origin !== undefined && req.url !== '/css/style.css') {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
  };
  console.log(req.method, req.path);
  next();
};

module.exports = {
  logEvents,
  logger
}