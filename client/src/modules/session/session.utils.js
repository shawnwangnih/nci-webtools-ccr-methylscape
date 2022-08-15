import axios from "axios";

export function formatTime(seconds) {
  const parts = [seconds / 60, seconds % 60];

  return parts
    .map((n) => Math.floor(n))
    .map((e) => String(e).padStart(2, "0"))
    .join(":");
}

export async function getUserSession() {
  try {
    const response = await axios.get("/api/session");
    return response.data;
  } catch (error) {
    console.error(error);
    return { authenticated: false };
  }
}

export async function getRefreshedUserSession() {
  try {
    const response = await axios.post("/api/session");
    return response.data;
  } catch (error) {
    console.error(error);
    return { authenticated: false };
  }
}

export function getRemainingTime(expires) {
  if (!expires) return 0;
  return Math.max(0, new Date(expires).getTime() - new Date().getTime()) / 1000;
}

export function hasExpired(expires) {
  return getRemainingTime(expires) <= 0;
}
