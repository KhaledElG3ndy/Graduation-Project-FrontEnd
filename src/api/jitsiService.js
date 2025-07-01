import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://localhost:7072',
});

export const createRoom = async (payload) => {
  const { data } = await api.post('/api/jitsi/create-room', payload);
  return data;
};

export const getActiveMeetings = async () => {
  const { data } = await api.get('/api/jitsi/active-meetings');
  return data;
};

export const joinRoom = async (roomName, userName) => {
  await api.post('/api/jitsi/join-room', { roomName, userName });
};

export const leaveRoom = async (roomName, userName) => {
  const url = `${import.meta.env.VITE_API_BASE || 'https://localhost:7072'}/api/jitsi/leave-room`;
  const data = JSON.stringify({ roomName, userName });
  if (navigator.sendBeacon) {
    // Use Blob to set Content-Type to application/json
    navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
  } else {
    await api.post('/api/jitsi/leave-room', { roomName, userName });
  }
};

export const getJoinInfo = async (roomName, userName) => {
  const { data } = await api.post('/api/jitsi/join-info', { roomName, userName });
  return data;
};
