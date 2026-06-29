// src/App.jsx
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import KothaFindAuth from "./KothaFindAuth";
import RenterApp from "./RenterApp";

export default function App() {
  const [user, setUser]   = useState(undefined); // undefined = still checking
  const [role, setRole]   = useState(null);

  // listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      if (!u) setRole(null);
    });
    return unsub;
  }, []);

  // still checking Firebase auth
  if (user === undefined) {
    return (
      <div style={{ minHeight:"100vh", background:"#0D0F14", display:"flex",
        alignItems:"center", justifyContent:"center", color:"#9A9590", fontSize:14 }}>
        Loading…
      </div>
    );
  }

  // not signed in → show auth screen
  if (!user) {
    return (
      <KothaFindAuth
        onSuccess={(info) => {
          setUser(info.user);
          setRole(info.role);
        }}
      />
    );
  }

  // signed in as renter → renter flow
  if (role === "renter") {
    return <RenterApp />;
  }

  // signed in as rentee → placeholder for now
  return (
    <div style={{ minHeight:"100vh", background:"#0D0F14", display:"flex",
      alignItems:"center", justifyContent:"center", color:"#E8E0D4", fontSize:16 }}>
      Rentee dashboard — coming soon
    </div>
  );
}