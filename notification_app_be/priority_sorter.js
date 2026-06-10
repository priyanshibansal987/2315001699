const WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

function getPriorityNotifications(list, limit = 10) {
  if (!Array.isArray(list)) return [];

  return [...list]
    .sort((a, b) => {
      const typeA = (a.Type || a.type || '').toLowerCase();
      const typeB = (b.Type || b.type || '').toLowerCase();

      const wA = WEIGHTS[typeA] || 0;
      const wB = WEIGHTS[typeB] || 0;

      // check weight first
      if (wB !== wA) {
        return wB - wA;
      }

      // fallback to date sorting (newest first)
      const dateA = new Date(a.Timestamp || a.timestamp || a.createdAt || 0);
      const dateB = new Date(b.Timestamp || b.timestamp || b.createdAt || 0);
      return dateB - dateA;
    })
    .slice(0, limit);
}

module.exports = { getPriorityNotifications };
