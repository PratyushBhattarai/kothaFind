import { auth } from "./firebase";

const BASE = import.meta.env.VITE_DJANGO_BASE;  // replace with your Railway URL

// get fresh token from any Firebase user object
async function authHeaders(firebaseUser) {
  const token = await firebaseUser.getIdToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// called after signup to save role + profile in Django
export async function registerRole(firebaseUser, role, phone, district, displayName) {
  try {
    const res = await fetch(`${BASE}/users/register/`, {
      method: "POST",
      headers: await authHeaders(firebaseUser),
      body: JSON.stringify({ role, phone, district, display_name: displayName }),
    });
    return res.json();
  } catch (err) {
    console.error("registerRole failed:", err);
  }
}

// called anywhere you need the current user's Django profile
export async function getMe() {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}/users/me/`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}