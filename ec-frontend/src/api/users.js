import { api } from './client'

export const updateMe = (data) => api.patch('/users/me/', data)

export const changePassword = (currentPassword, newPassword) =>
  api.post('/users/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  })
