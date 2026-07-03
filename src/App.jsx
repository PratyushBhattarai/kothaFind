// src/App.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import KothaFindAuth from "./KothaFindAuth";
import RenterApp from "./RenterApp";
//import RenteeApp from "./RenteeApp";

const DJANGO_BASE = import.meta.env.VITE_DJANGO_BASE || "http://127.0.0.1:8000/api";

async function fetchRole(firebaseUser) {
  const token = await firebaseUser.getIdToken();
  const res = await fetch(`${DJANGO_BASE}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("profile fetch failed");
  const data = await res.json();
  return data.role; // "renter" or "rentee"
}

function LoadingScreen({ message = "Loading…" }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0D0F14", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
      <div style={{ width:32, height:32, borderRadius:"50%",
        border:"2px solid rgba(245,166,35,0.15)", borderTopColor:"#F5A623",
        animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color:"#9A9590", fontSize:13, fontFamily:"Inter,sans-serif" }}>
        {message}
      </p>
    </div>
  );
}

export default function App() {
  // undefined  = Firebase still initialising
  // null       = signed out
  // object     = signed in
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [role,         setRole]         = useState(null);
  const [roleLoading,  setRoleLoading]  = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u || null);

      if (!u) {
        setRole(null);
        return;
      }

      // user is signed in — fetch their role from Django
      setRoleLoading(true);
      try {
        const r = await fetchRole(u);
        console.log("Role from Django:", r); // debug — remove later
        setRole(r || null);
      } catch (e) {
        console.error("Could not fetch role:", e);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return unsub;
  }, []);

  // called by KothaFindAuth after login/signup
  const handleAuthSuccess = (info) => {
    setFirebaseUser(info.user);
    setRole(info.role);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Firebase still starting up
  if (firebaseUser === undefined) {
    return <LoadingScreen message="Starting up…" />;
  }

  // Firebase ready but fetching role from Django
  if (firebaseUser && roleLoading) {
    return <LoadingScreen message="Loading your profile…" />;
  }

  // not signed in
  if (!firebaseUser) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // signed in but role still unknown (Django profile missing)
  if (!role) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // signed in as renter
  if (role === "renter") {
    return <RenterApp />;
  }

  // signed in as rentee
  //if (role === "rentee") {
    //return <RenteeApp />;
  //}

  // fallback
  return <KothaFindAuth onSuccess={handleAuthSuccess} />;
}
