// src/App.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import KothaFindAuth from "./KothaFindAuth";
import RenterApp from "./RenterApp";

const DJANGO_BASE = import.meta.env.VITE_DJANGO_BASE || "http://127.0.0.1:8000/api/listings";

// For users endpoint — different base
async function fetchRole(firebaseUser) {
  const token = await firebaseUser.getIdToken();
  const usersBase = import.meta.env.VITE_DJANGO_USERS || "http://127.0.0.1:8000/api/users";
  const res = await fetch(`${usersBase}/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("failed");
  const data = await res.json();
  return data.role;
}

function LoadingScreen({ message = "Loading..." }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D0F14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid rgba(245,166,35,0.15)",
          borderTopColor: "#F5A623",
          animation: "spin 0.8s linear infinite",
        }}
      />

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <p
        style={{
          color: "#9A9590",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user || null);

      if (!user) {
        setRole(null);
        return;
      }

      setRoleLoading(true);

      try {
        const userRole = await fetchRole(user);
        console.log("Role:", userRole);
        setRole(userRole);
      } catch (err) {
        console.error(err);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleAuthSuccess = ({ user, role }) => {
    setFirebaseUser(user);
    setRole(role);
  };

  // Firebase is initializing
  if (firebaseUser === undefined) {
    return <LoadingScreen message="Starting up..." />;
  }

  // Loading profile from Django
  if (firebaseUser && roleLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  // Not signed in
  if (!firebaseUser) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // Signed in but profile not created
  if (!role) {
    return <KothaFindAuth onSuccess={handleAuthSuccess} />;
  }

  // Only renter is supported
  if (role === "renter") {
    return <RenterApp />;
  }

  // Fallback
  return <KothaFindAuth onSuccess={handleAuthSuccess} />;
}