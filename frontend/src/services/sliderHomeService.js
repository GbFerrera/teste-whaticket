import api from "./api";

export const listSliderBanners = () => api.get("/slider-home");

export const createSliderBanner = (data) => {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.image) {
    formData.append("image", data.image);
  }
  return api.post("/slider-home", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const updateSliderBanner = (id, data) => {
  const formData = new FormData();
  if (data.name !== undefined) {
    formData.append("name", data.name);
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  return api.put(`/slider-home/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const deleteSliderBanner = (id) => api.delete(`/slider-home/${id}`);

export default {
  listSliderBanners,
  createSliderBanner,
  updateSliderBanner,
  deleteSliderBanner
};
