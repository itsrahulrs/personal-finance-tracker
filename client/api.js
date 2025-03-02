export const API_BASE_URL = "http://192.168.31.167:8000/api";

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem("authToken");

  return fetch(`${API_BASE_URL}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
