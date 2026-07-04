// ─────────────────────────────────────────────────────────────────────────────
// RenterApp.jsx  — root for the renter side
// Decides: show onboarding OR dashboard based on whether terms are accepted
// Import this inside App.jsx when role === "renter"
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import RenterOnboarding from "./RenterOnboarding";
import RenterDashboard  from "./RenterDashboard";

const BASE = import.meta.env.VITE_DJANGO_USERS || "http://127.0.0.1:8000/api/users";

async function getProfile() {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export default function RenterApp() {
  const [state, setState] = useState("loading"); // "loading"|"onboarding"|"dashboard"

  useEffect(()=>{
    getProfile()
      .then(profile => {
        // if terms accepted → go to dashboard; else → onboarding
        setState(profile.is_verified ? "dashboard" : "onboarding");
      })
      .catch(() => setState("onboarding"));
  }, []);

  if (state === "loading") {
    return (
      <div style={{minHeight:"100vh",background:"#0D0F14",display:"flex",
        alignItems:"center",justifyContent:"center",color:"#9A9590",fontSize:14}}>
        Loading…
      </div>
    );
  }

  if (state === "onboarding") {
    return <RenterOnboarding onComplete={() => setState("dashboard")} />;
  }

  return <RenterDashboard onAddRoom={() => {/* navigate to add room */}} />;
}
