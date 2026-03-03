import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginRequest({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function fetchVehicles() {
  const { data } = await api.get("/vehicles");
  return data.vehicles;
}

export async function fetchLatestPositionsAll() {
  const { data } = await api.get("/positions/latest");
  return data.positions;
}

export async function fetchHistoryForVehicle(vehicleId, { limit = 500 } = {}) {
  const { data } = await api.get(
    `/positions/vehicle/${vehicleId}/history`,
    { params: { limit } }
  );
  return data.positions;
}
export async function searchWithinRadius({ lat, lng, radius_m }) {
  const { data } = await api.get("/search/within-radius", {
    params: { lat, lng, radius_m }
  });
  return data.vehicles;
}

export async function searchNearest({ lat, lng }) {
  const { data } = await api.get("/search/nearest", {
    params: { lat, lng }
  });
  return data.vehicle;
}
export async function createVehicle({ name, plate_number }) {
  const { data } = await api.post("/vehicles", { name, plate_number });
  return data.vehicle;
}

export async function updateVehicle(id, { name, plate_number }) {
  const { data } = await api.put(`/vehicles/${id}`, { name, plate_number });
  return data.vehicle;
}

export async function deleteVehicle(id) {
  await api.delete(`/vehicles/${id}`);
}
export async function recordPosition({ vehicle_id, lat, lng, recorded_at }) {
  const { data } = await api.post("/positions", { vehicle_id, lat, lng, recorded_at });
  return data.position;
}

export async function fetchHistoryWithFilters(vehicleId, { from, to, limit = 500 } = {}) {
  const { data } = await api.get(`/positions/vehicle/${vehicleId}/history`, {
    params: { from, to, limit }
  });
  return data.positions;
}