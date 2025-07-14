import { getCookie } from "./cookies";

export const ACCESS_TOKEN = "access-token";
export const REFRESH_TOKEN = "refresh-token";

export async function getMeTemp() {
  const accessToken = await getCookie(ACCESS_TOKEN);

  if (!accessToken) return null;

  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Failed to fetch user");
  }

  return response.json();
}

export async function getMe(accessToken: string) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Failed to fetch user");
  }

  return response.json();
}

export async function refresh(refreshToken: string) {
  const response = await fetch(`${process.env.EXTERNAL_API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "Failed to refresh token");
  }

  const data = await response.json();
  const newAccessToken = data.accessToken;

  if (!newAccessToken) {
    throw new Error("New access token not found in refresh response.");
  }

  return newAccessToken;
}
