import api from './axios';

export const createConversation = (payload) => api.post('/chat', payload);
export const getConversations = () => api.get('/chat');
export const getMessages = (chatId) => api.get(`/chat/${chatId}/messages`);
export const sendMessage = (chatId, text, attachment) => api.post(`/chat/${chatId}/messages`, { text, attachment });
export const startProductConversation = (productId, message, attachment) => api.post(`/chat/product/${productId}`, { message, attachment });
export const markMessagesRead = (chatId) => api.post(`/chat/${chatId}/read`);
export const getAllConversations = () => api.get('/chat/admin/all');
export const uploadChatAttachment = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
