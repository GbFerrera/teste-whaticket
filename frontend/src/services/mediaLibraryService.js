import api from "./api";

export const getMediaFolders = (params = {}) =>
  api.get("/media-folders", { params });

export const createMediaFolder = (payload) =>
  api.post("/media-folders", payload);

export const updateMediaFolder = (folderId, payload) =>
  api.put(`/media-folders/${folderId}`, payload);

export const deleteMediaFolder = (folderId) =>
  api.delete(`/media-folders/${folderId}`);

export const getFolderFiles = (folderId) =>
  api.get(`/media-folders/${folderId}/files`);

export const uploadMediaFile = (folderId, data, config = {}) =>
  api.post(`/media-folders/${folderId}/files`, data, {
    headers: { "Content-Type": "multipart/form-data" },
    ...config
  });

export const updateMediaFile = (fileId, payload) =>
  api.put(`/media-files/${fileId}`, payload);

export const deleteMediaFile = (fileId) =>
  api.delete(`/media-files/${fileId}`);
