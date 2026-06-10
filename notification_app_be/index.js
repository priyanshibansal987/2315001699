const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const logger = require('../logging_middleware/middleware');
const { getPriorityNotifications } = require('./priority_sorter');

const app = express();
const port = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());
app.use(logger({ logFilePath: './requests.log' }));

// mock in-memory notifications
let db = [
  {
    ID: "d146095a-0d86-4a34-9e69-3900a14576bc",
    Type: "Result",
    Message: "Mid-semester exams grade sheets published",
    Timestamp: "2026-04-22 17:51:30",
    isRead: false
  },
  {
    ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
    Type: "placement",
    Message: "CSX Corporation hiring for Software Engineer roles",
    Timestamp: "2026-04-22 17:51:18",
    isRead: false
  },
  {
    ID: "81589ada-0ad3-4f77-9554-f52fb558e09d",
    Type: "Event",
    Message: "Annual graduation farewell celebration details inside",
    Timestamp: "2026-04-22 17:51:06",
    isRead: false
  },
  {
    ID: "0005513a-142b-4bbc-8678-eefec65e1ede",
    Type: "Result",
    Message: "Mid-semester grading guidelines released",
    Timestamp: "2026-04-22 17:50:54",
    isRead: true
  },
  {
    ID: "ea836726-c25e-4f21-a72f-544a6af8a37f",
    Type: "Result",
    Message: "Project reviews scheduled for upcoming week",
    Timestamp: "2026-04-22 17:50:42",
    isRead: false
  },
  {
    ID: "f4a56711-2bce-481b-871d-55e11df3c11a",
    Type: "Placement",
    Message: "Microsoft mock placement interview sign-up is open",
    Timestamp: "2026-06-09 10:30:00",
    isRead: false
  },
  {
    ID: "3cd24ba8-9a4f-4d33-bcff-12a43b123cd4",
    Type: "Event",
    Message: "Tech Fest 2026 key speakers finalized",
    Timestamp: "2026-06-08 15:45:00",
    isRead: true
  }
];

// sse connections
let clients = [];

const pushToClients = (event, data) => {
  clients.forEach(client => {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'EduPulse Notification API is active' });
});

// SSE streaming endpoint
app.get('/api/notifications/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const keepAlive = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 20000);

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  console.log(`[SSE] client connected: ${clientId}. active: ${clients.length}`);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients = clients.filter(c => c.id !== clientId);
    console.log(`[SSE] client disconnected: ${clientId}. active: ${clients.length}`);
  });
});

// fetch all (supports page, limit, type filters)
app.get('/api/notifications', (req, res) => {
  const { page = 1, limit = 10, notification_type } = req.query;
  let items = [...db];

  if (notification_type) {
    items = items.filter(n => n.Type.toLowerCase() === notification_type.toLowerCase());
  }

  // sort newest first
  items.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const total = items.length;
  const start = (pageNum - 1) * limitNum;
  
  res.json({
    success: true,
    data: {
      notifications: items.slice(start, start + limitNum),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        pageSize: limitNum,
        totalItems: total
      }
    }
  });
});

// priority inbox
app.get('/api/notifications/priority', (req, res) => {
  const limit = parseInt(req.query.limit || 10);
  const unread = db.filter(n => !n.isRead);
  const sorted = getPriorityNotifications(unread, limit);

  res.json({
    success: true,
    data: {
      notifications: sorted
    }
  });
});

// read single
app.put('/api/notifications/:id/read', (req, res) => {
  const item = db.find(n => n.ID === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  item.isRead = true;
  pushToClients('update', item);

  res.json({ success: true, data: item });
});

// read all
app.put('/api/notifications/read-all', (req, res) => {
  let count = 0;
  db.forEach(n => {
    if (!n.isRead) {
      n.isRead = true;
      count++;
    }
  });

  pushToClients('readAll', { countAffected: count });
  res.json({ success: true, data: { countAffected: count } });
});

// create new notification
app.post('/api/notifications', (req, res) => {
  const { type, message } = req.body;
  if (!type || !message) {
    return res.status(400).json({ success: false, error: 'missing fields' });
  }

  const newItem = {
    ID: uuidv4(),
    Type: type,
    Message: message,
    Timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    isRead: false
  };

  db.unshift(newItem);
  pushToClients('new', newItem);

  res.status(201).json({ success: true, data: newItem });
});

// delete notification
app.delete('/api/notifications/:id', (req, res) => {
  const index = db.findIndex(n => n.ID === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  const deleted = db.splice(index, 1)[0];
  pushToClients('delete', { ID: req.params.id });

  res.json({ success: true, data: deleted });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
