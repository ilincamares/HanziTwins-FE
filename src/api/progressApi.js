import apiClient from "./client";

export async function saveQuizAttempt(payload) {
  const response = await apiClient.post("/progress/attempts", payload);
  return response.data;
}

export async function getProgressSummary(userId) {
  const response = await apiClient.get(`/progress/${userId}`);
  return response.data;
}

export async function getUserMistakes(userId) {
  const response = await apiClient.get(`/progress/${userId}/mistakes`);
  return response.data;
}

export async function getUserAttempts(userId) {
  const response = await apiClient.get(`/progress/${userId}/attempts`);
  return response.data;
}
export async function generateReviewQuiz(userId, count = 5, difficulty = "medium") {
  const response = await apiClient.get(`/progress/${userId}/review`, {
    params: {
      count,
      difficulty,
    },
  });

  return response.data;
}