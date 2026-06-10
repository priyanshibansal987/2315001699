import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  Divider,
  Box,
  AppBar,
  Toolbar,
  Badge,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axios from 'axios';

const API = 'http://localhost:5007/api';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3b82f6' },
    secondary: { main: '#10b981' },
    background: {
      default: '#0b0f19',
      paper: '#151c2c',
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
  },
});

const TYPE_COLORS = {
  placement: '#ef4444',
  result: '#8b5cf6',
  event: '#10b981',
};

function App() {
  const [notifications, setNotifications] = useState([]);
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('All');
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [simType, setSimType] = useState('Placement');
  const [simMsg, setSimMsg] = useState('');
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  // fetch general feed
  const loadFeed = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/notifications?limit=100`);
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      showToast('failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // fetch priority inbox
  const loadPriority = async () => {
    try {
      const res = await axios.get(`${API}/notifications/priority?limit=${limit}`);
      if (res.data.success) {
        setPriorityNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    loadPriority();
  }, [notifications, limit]);

  // SSE setup
  useEffect(() => {
    const sse = new EventSource(`${API}/notifications/stream`);

    sse.onopen = () => setConnected(true);
    sse.onerror = () => setConnected(false);

    sse.addEventListener('new', (e) => {
      const data = JSON.parse(e.data);
      setNotifications(prev => [data, ...prev]);
      showToast(`new ${data.Type} notification received`, 'info');
    });

    sse.addEventListener('update', (e) => {
      const data = JSON.parse(e.data);
      setNotifications(prev => prev.map(n => n.ID === data.ID ? data : n));
    });

    sse.addEventListener('readAll', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('all notifications marked as read', 'success');
    });

    sse.addEventListener('delete', (e) => {
      const { ID } = JSON.parse(e.data);
      setNotifications(prev => prev.filter(n => n.ID !== ID));
    });

    return () => sse.close();
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/${id}/read`);
      showToast('marked as read', 'success');
    } catch (err) {
      showToast('failed to update status', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API}/notifications/read-all`);
    } catch (err) {
      showToast('failed to update status', 'error');
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API}/notifications/${id}`);
      showToast('notification deleted', 'warning');
    } catch (err) {
      showToast('failed to delete', 'error');
    }
  };

  const broadcastSim = async (e) => {
    e.preventDefault();
    if (!simMsg.trim()) return;

    try {
      const res = await axios.post(`${API}/notifications`, {
        type: simType,
        message: simMsg,
      });
      if (res.data.success) {
        setSimMsg('');
        showToast('notification broadcasted successfully', 'success');
      }
    } catch (err) {
      showToast('failed to send broadcast', 'error');
    }
  };

  const showToast = (msg, severity = 'success') => {
    setToast({ open: true, msg, severity });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredFeed = notifications.filter(n => {
    if (filter === 'All') return true;
    return n.Type.toLowerCase() === filter.toLowerCase();
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EduPulse
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={connected ? <WifiIcon color="success" /> : <WifiOffIcon color="error" />}
                label={connected ? 'Live Sync' : 'Offline'}
                color={connected ? 'success' : 'error'}
                variant="outlined"
                size="small"
                sx={{ borderRadius: '6px' }}
              />

              <Badge badgeContent={unreadCount} color="error">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
        <Grid container spacing={4}>
          
          {/* Priority Inbox Column */}
          <Grid item xs={12} md={5}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #151c2c 0%, #0d131f 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon sx={{ color: '#f59e0b' }} />
                        <Typography variant="h6">Priority Inbox</Typography>
                      </Box>
                      
                      <FormControl size="small" sx={{ minWidth: 100 }}>
                        <InputLabel>Limit</InputLabel>
                        <Select
                          value={limit}
                          label="Limit"
                          onChange={(e) => setLimit(Number(e.target.value))}
                          sx={{ borderRadius: '6px' }}
                        >
                          <MenuItem value={5}>Top 5</MenuItem>
                          <MenuItem value={10}>Top 10</MenuItem>
                          <MenuItem value={15}>Top 15</MenuItem>
                          <MenuItem value={20}>Top 20</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={30} /></Box>
                    ) : priorityNotifications.length === 0 ? (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                        <Typography color="text.secondary">All caught up!</Typography>
                      </Box>
                    ) : (
                      <List disablePadding>
                        {priorityNotifications.map((n) => (
                          <ListItem
                            key={n.ID}
                            alignItems="flex-start"
                            sx={{
                              px: 1,
                              py: 1.5,
                              borderRadius: '8px',
                              mb: 1,
                              background: 'rgba(59, 130, 246, 0.03)',
                              borderLeft: `4px solid ${TYPE_COLORS[(n.Type || '').toLowerCase()] || '#999'}`
                            }}
                            secondaryAction={
                              <IconButton edge="end" onClick={() => markRead(n.ID)}>
                                <CheckCircleIcon color="action" fontSize="small" />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Chip
                                    label={n.Type}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      backgroundColor: `${TYPE_COLORS[(n.Type || '').toLowerCase()]}15`,
                                      color: TYPE_COLORS[(n.Type || '').toLowerCase()],
                                      border: `1px solid ${TYPE_COLORS[(n.Type || '').toLowerCase()]}30`
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {n.Timestamp}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, pr: 4 }}>
                                  {n.Message}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Simulation Card */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <SendIcon color="primary" />
                      <Typography variant="h6">Broadcast Simulator</Typography>
                    </Box>

                    <form onSubmit={broadcastSim}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Type</InputLabel>
                            <Select
                              value={simType}
                              label="Type"
                              onChange={(e) => setSimType(e.target.value)}
                              sx={{ borderRadius: '6px' }}
                            >
                              <MenuItem value="Placement">Placement</MenuItem>
                              <MenuItem value="Result">Result</MenuItem>
                              <MenuItem value="Event">Event</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Message"
                            value={simMsg}
                            onChange={(e) => setSimMsg(e.target.value)}
                            placeholder="Notification text..."
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            endIcon={<SendIcon />}
                            disabled={!simMsg.trim()}
                          >
                            Send Broadcast
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Activity Feed Column */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Activity Feed</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    sx={{ borderColor: 'rgba(255,255,255,0.15)' }}
                  >
                    Mark All Read
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  {['All', 'Placement', 'Result', 'Event'].map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      clickable
                      color={filter === t ? 'primary' : 'default'}
                      onClick={() => setFilter(t)}
                      variant={filter === t ? 'contained' : 'outlined'}
                      sx={{ borderRadius: '6px', fontWeight: 600 }}
                    />
                  ))}
                </Box>

                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
                ) : filteredFeed.length === 0 ? (
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography color="text.secondary">No notifications found.</Typography>
                  </Box>
                ) : (
                  <List disablePadding>
                    {filteredFeed.map((n) => (
                      <ListItem
                        key={n.ID}
                        sx={{
                          px: 2,
                          py: 2,
                          borderRadius: '8px',
                          mb: 2,
                          backgroundColor: n.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(59, 130, 246, 0.05)',
                          borderLeft: n.isRead ? '4px solid transparent' : '4px solid #3b82f6',
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {!n.isRead && (
                              <IconButton onClick={() => markRead(n.ID)} sx={{ mr: 1 }}>
                                <CheckCircleIcon color="primary" fontSize="small" />
                              </IconButton>
                            )}
                            <IconButton onClick={() => deleteItem(n.ID)}>
                              <DeleteIcon color="error" fontSize="small" />
                            </IconButton>
                          </Box>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CircleIcon sx={{ fontSize: 10, color: n.isRead ? 'text.secondary' : '#3b82f6', opacity: n.isRead ? 0.3 : 1 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Chip
                                  label={n.Type}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    backgroundColor: `${TYPE_COLORS[(n.Type || '').toLowerCase()]}15`,
                                    color: TYPE_COLORS[(n.Type || '').toLowerCase()],
                                    border: `1px solid ${TYPE_COLORS[(n.Type || '').toLowerCase()]}30`
                                  }}
                                />
                              <Typography variant="caption" color="text.secondary">
                                {n.Timestamp}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="body2"
                              color={n.isRead ? 'text.secondary' : 'text.primary'}
                              sx={{ fontWeight: n.isRead ? 400 : 600, pr: 6 }}
                            >
                              {n.Message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ width: '100%', borderRadius: '8px' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
