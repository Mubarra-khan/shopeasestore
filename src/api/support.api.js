import api from './axios';

export const getAiSupport = (message) => api.post('/support/ai', { message });
export const createSupportConversation = (message) => api.post('/support/conversation', { message });
