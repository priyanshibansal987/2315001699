const { getPriorityNotifications } = require('./priority_sorter');

// Sample notifications from the prompt & backend
const testNotifications = [
  {
    ID: "d146095a-0d86-4a34-9e69-3900a14576bc",
    Type: "Result",
    Message: "mid-sem results",
    Timestamp: "2026-04-22 17:51:30",
    isRead: false
  },
  {
    ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
    Type: "placement",
    Message: "CSX Corporation hiring",
    Timestamp: "2026-04-22 17:51:18",
    isRead: false
  },
  {
    ID: "81589ada-0ad3-4f77-9554-f52fb558e09d",
    Type: "Event",
    Message: "farewell",
    Timestamp: "2026-04-22 17:51:06",
    isRead: false
  },
  {
    ID: "0005513a-142b-4bbc-8678-eefec65e1ede",
    Type: "Result",
    Message: "mid-sem guidelines",
    Timestamp: "2026-04-22 17:50:54",
    isRead: false
  },
  {
    ID: "ea836726-c25e-4f21-a72f-544a6af8a37f",
    Type: "Result",
    Message: "project-review details",
    Timestamp: "2026-04-22 17:50:42",
    isRead: false
  },
  {
    ID: "f4a56711-2bce-481b-871d-55e11df3c11a",
    Type: "Placement",
    Message: "Microsoft mock placement",
    Timestamp: "2026-06-09 10:30:00",
    isRead: false
  },
  {
    ID: "3cd24ba8-9a4f-4d33-bcff-12a43b123cd4",
    Type: "Event",
    Message: "Tech Fest 2026 speaker announcements",
    Timestamp: "2026-06-08 15:45:00",
    isRead: false
  }
];

console.log("=== Original Unsorted Notifications ===");
testNotifications.forEach((n, idx) => {
  console.log(`${idx + 1}. [${n.Type}] - ${n.Timestamp} - ${n.Message}`);
});

const top10 = getPriorityNotifications(testNotifications, 10);

console.log("\n=== Sorted Priority Inbox Notifications (Placement > Result > Event) ===");
top10.forEach((n, idx) => {
  console.log(`${idx + 1}. [${n.Type}] - ${n.Timestamp} - ${n.Message}`);
});
