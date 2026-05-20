import apiClient from "./client";

export async function getEmbeddingMap(hskLevel = "all", method = "umap") {
  const response = await apiClient.get("/explorer/map", {
    params: {
      hsk_level: hskLevel,
      method,
    },
  });

  return response.data;
}
export async function getCharacterNeighbors(character, limit = 5) {
  const encodedCharacter = encodeURIComponent(character);

  const response = await apiClient.get(
    `/explorer/${encodedCharacter}/neighbors`,
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
}