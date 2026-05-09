import apiClient from "./client";

export async function getUsers() {
  const response = await apiClient.get("/users/");
  return response.data;
}

export async function createOrLoadUser(username) {
  const response = await apiClient.post("/users/", {
    username,
  });

  return response.data;
}

export async function getUser(userId) {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
}