const fs = require('fs');
const path = require('path');

module.exports = (options = {}) => {
  const logPath = options.logFilePath || path.join(process.cwd(), 'requests.log');

  return (req, res, next) => {
    const start = process.hrtime();
    const timestamp = new Date().toISOString();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const { method, url } = req;

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const latency = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      const status = res.statusCode;
      const size = res.get('Content-Length') || 0;

      const logMsg = `[${timestamp}] IP: ${ip} | ${method} ${url} | Status: ${status} | Size: ${size}B | Time: ${latency}ms\n`;

      // Console log for quick debugging
      console.log(`[HTTP] ${method} ${url} - ${status} (${latency}ms)`);

      // File logger
      fs.appendFile(logPath, logMsg, (err) => {
        if (err) console.error('logger error:', err.message);
      });
    });

    next();
  };
};
