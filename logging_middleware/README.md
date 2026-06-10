# Logging Middleware

A simple, lightweight Express middleware for logging incoming HTTP requests and outgoing HTTP responses with latency measurements, response size, status codes, and IP addresses.

## Installation

Add the folder to your workspace and import it:

```javascript
const loggingMiddleware = require('./logging_middleware/middleware');
```

## Usage

```javascript
const express = require('express');
const loggingMiddleware = require('./logging_middleware/middleware');

const app = express();

// Use the logger
app.use(loggingMiddleware({
  logFilePath: './requests.log' // Optional custom file path
}));

app.get('/test', (req, res) => {
  res.send('Success!');
});

app.listen(5000);
```

### Log Output format
Console log:
```
[HTTP] GET /api/notifications - 200 (15.200ms)
```

File log (`requests.log`):
```
[2026-06-10T12:00:00.000Z] IP: ::1 | GET /api/notifications | Status: 200 | Size: 124B | Duration: 15.200ms
```
