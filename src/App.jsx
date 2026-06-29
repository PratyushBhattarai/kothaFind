// src/App.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import KothaFindAuth from "./KothaFindAuth";
import RenterApp from "./RenterApp";

const DJANGO_BASE = "https://kothafind-production.up.railway.app"; // change to Railway URL in production

async function fetchProfile(firebaseUser) {
  const token = await firebaseUser.getIdToken();
  const res = await fetch(`${DJANGO_BASE}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("profile fetch failed");
  return res.json();
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen({ message = "Loading…" }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0F14",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    }}>
      {/* spinner */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "2px solid rgba(42,191,191,0.15)",
        borderTopColor: "#2ABFBF",
        animation: "spin 0.8s linear infinite",
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: "#9A9590", fontSize: 13, fontFamily: "Inter, sans-serif" }}>
        {message}
      </p>
    </div>
  );
}

// ── Rentee placeholder ────────────────────────────────────────────────────────
function RenteeApp() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0F14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <h2 style={{
        fontFamily: "'Sora', sans-serif",
        color: "#E8E0D4",
        fontSize: 20,
        fontWeight: 700,
        margin: 0,
      }}>
        Rentee dashboard
      </h2>
      <p style={{ color: "#9A9590", fontSize: 13 }}>Coming soon — browse rooms across Kathmandu Valley</p>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  // undefined  = Firebase still initialising (show spinner)
  // null       = no user signed in (show auth)
  // object     = signed-in Firebase user
  const [firebaseUser, setFirebaseUser] = useState(undefined);

  // role comes from Django profile ("renter" | "rentee" | null)
  const [role,    setRole]    = useState(null);
  const [loading, setLoading] = useState(true);  // fetching Django profile

  // ── Listen to Firebase auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        // signed out
        setRole(null);
        setLoading(false);
        return;
      }

      // signed in — fetch role from Django
      setLoading(true);
      try {
        const profile = await fetchProfile(user);
        setRole(profile.role || null);
      } catch {
        // Django might not have a profile yet (first sign-in)
        // role will be set by KothaFindAuth onSuccess below
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsub; // cleanup on unmount
  }, []);

  // ── Called by KothaFindAuth after successful login / signup ───────────────
  const handleAuthSuccess = (info) => {
    // info = { user, role, method, isNew }
    setFirebaseUser(info.user);
    setRole(info.role);
  };

  // ── Render logic ──────────────────────────────────────────────────────────

  // 1. Firebase still initialising
  if (firebaseUser === undefined) {
    return <LoadingScreen message="Starting up…" />;
  }

  // 2. Firebase ready but fetching Django profile
  if (firebaseUser && loading) {
    return <LoadingScreen message="Loading your profile…" />;
  }

  // 3. Not signed in → show auth
  if (!firebaseUser) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // 4. Signed in but role unknown (edge case: Django profile missing)
  if (!role) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // 5. Signed in as renter
  if (role === "renter") {
    return <RenterApp />;
  }

  // 6. Signed in as rentee
  if (role === "rentee") {
    return <RenteeApp />;
  }

  // fallback
  return <KothaFindAuth onSuccess={handleAuthSuccess} />;
}
