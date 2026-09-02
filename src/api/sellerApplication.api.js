import api from './axios';

export const submitSellerApplication = (payload) =>
  api.post('/users/seller-applications', payload);

export const getMySellerApplication = () =>
  api.get('/users/seller-applications/me');

export const getSellerApplications = (status) =>
  api.get('/users/admin/seller-applications', {
    params: status ? { status } : undefined,
  });

export const approveSellerApplication = (applicationId) =>
  api.patch(`/users/admin/seller-applications/${applicationId}/approve`);

export const rejectSellerApplication = (applicationId, rejectionReason) =>
  api.patch(`/users/admin/seller-applications/${applicationId}/reject`, {
    rejectionReason,
  });
