import api from "./api";

export const createTutorialVideo = (data) => {
  return api.post("/tutorial-videos", data);
};

export const listTutorialVideos = (params) => {
  return api.get("/tutorial-videos", { params });
};

export const showTutorialVideo = (id, incrementView = false) => {
  return api.get(`/tutorial-videos/${id}`, {
    params: { incrementView }
  });
};

export const updateTutorialVideo = (id, data) => {
  return api.put(`/tutorial-videos/${id}`, data);
};

export const deleteTutorialVideo = (id, hardDelete = false) => {
  return api.delete(`/tutorial-videos/${id}`, {
    params: { hardDelete }
  });
};

export const getVideoThumbnailFallback = (videoUrl) => {
  if (!videoUrl) return null;

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = videoUrl.match(regExp);

  if (match && match[2].length === 11) {
    return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
  }

  return null;
};
