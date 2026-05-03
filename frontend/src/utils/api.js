import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

export const chatService = {
  send: (message, sessionId, language, lat, lng) =>
    api.post('/chat', {
      message,
      session_id: sessionId,
      language,
      user_lat: lat,
      user_lng: lng,
    }),
};

export const boothService = {
  find: (lat, lng, radius = 3000) =>
    api.get('/booth', { params: { lat, lng, radius } }),
};

export const candidateService = {
  getAll: (constituency, state) =>
    api.get('/candidates', { params: { constituency, state } }),
};

export const electionService = {
  getDates: () => api.get('/elections'),
};

export const reportService = {
  submit: (sessionId, category, description, lat, lng, image) =>
    api.post('/report', {
      session_id: sessionId,
      category,
      description,
      latitude: lat,
      longitude: lng,
      image,
    }),
};

export const userService = {
  setup: (data) => api.post('/user/setup', data),
};

export default api;
