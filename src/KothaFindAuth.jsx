import { useState } from "react";

const COLORS = {
  bg: "#0D0F14",
  surf: "#141720",
  card: "#1A1E2A",
  card2: "#1F2435",
  bdr: "rgba(255,255,255,0.07)",
  bdr2: "rgba(255,255,255,0.13)",
  gold: "#F5A623",
  goldDim: "rgba(245,166,35,0.12)",
  goldBdr: "rgba(245,166,35,0.35)",
  teal: "#2ABFBF",
  tealDim: "rgba(42,191,191,0.10)",
  tealBdr: "rgba(42,191,191,0.35)",
  txt: "#E8E0D4",
  txt2: "#9A9590",
  txt3: "#5A5650",
  red: "#E8604C",
  green: "#4CAF7D",
};

// ── tiny shared primitives ──────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 17, color: COLORS.txt }}>
      <div style={{ width: 8, height: 8, background: COLORS.gold, borderRadius: "50%" }} />
      Kotha<span style={{ color: COLORS.gold }}>Find</span>
    </div>
  );
}

function Mandala({ size = 36, opacity = 0.3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="none" stroke={COLORS.gold} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={COLORS.gold} strokeWidth="1" />
      <circle cx="100" cy="100" r="30" fill="none" stroke={COLORS.gold} strokeWidth="0.8" />
      <line x1="10" y1="100" x2="190" y2="100" stroke={COLORS.gold} strokeWidth="0.8" />
      <line x1="100" y1="10" x2="100" y2="190" stroke={COLORS.gold} strokeWidth="0.8" />
      <line x1="37" y1="37" x2="163" y2="163" stroke={COLORS.gold} strokeWidth="0.6" />
      <line x1="163" y1="37" x2="37" y2="163" stroke={COLORS.gold} strokeWidth="0.6" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: COLORS.txt2, marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ type = "text", placeholder, value, onChange, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        background: COLORS.card,
        border: `0.5px solid ${focused ? "rgba(255,255,255,0.3)" : COLORS.bdr2}`,
        borderRadius: 9,
        padding: "11px 14px",
        fontSize: 14,
        color: COLORS.txt,
        fontFamily: "Inter, sans-serif",
        outline: "none",
        transition: "border-color 0.15s",
        ...style,
      }}
    />
  );
}

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: COLORS.card,
          border: `0.5px solid ${focused ? "rgba(255,255,255,0.3)" : COLORS.bdr2}`,
          borderRadius: 9,
          padding: "11px 42px 11px 14px",
          fontSize: 14,
          color: COLORS.txt,
          fontFamily: "Inter, sans-serif",
          outline: "none",
        }}
      />
      <button
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: COLORS.txt3, cursor: "pointer", fontSize: 16, padding: 2,
        }}
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}

function SocialRow() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
        <div style={{ flex: 1, height: "0.5px", background: COLORS.bdr2 }} />
        <span style={{ fontSize: 11, color: COLORS.txt3 }}>or continue with</span>
        <div style={{ flex: 1, height: "0.5px", background: COLORS.bdr2 }} />
      </div>
      <button
        style={{
          width: "100%", padding: "10px 0", background: COLORS.card,
          border: `0.5px solid ${COLORS.bdr2}`, borderRadius: 9,
          color: COLORS.txt2, fontSize: 13, cursor: "pointer",
          fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        G &nbsp; Continue with Google
      </button>
    </>
  );
}

// ── Role selector ───────────────────────────────────────────────────────────

function RoleCard({ roleKey, icon, title, desc, perks, accent, accentDim, accentBdr, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onSelect(roleKey)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? accentDim : COLORS.card,
        border: `0.5px solid ${hovered ? accentBdr : COLORS.bdr2}`,
        borderRadius: 14, padding: "24px 20px",
        cursor: "pointer", textAlign: "center",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        background: accentDim, display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 14px", fontSize: 22, color: accent,
      }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 600, color: accent, marginBottom: 6 }}>
        {title}
      </h3>
      <p style={{ fontSize: 12, color: COLORS.txt2, lineHeight: 1.5, marginBottom: 12 }}>{desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {perks.map((p) => (
          <div key={p} style={{ fontSize: 11, color: COLORS.txt2, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ color: accent, fontSize: 13 }}>✓</span> {p}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleScreen({ onSelect }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <Mandala size={38} />
      </div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 5, color: COLORS.txt }}>
        Welcome to KothaFind
      </h2>
      <p style={{ fontSize: 13, color: COLORS.txt2, textAlign: "center", marginBottom: 2 }}>
        Kathmandu Valley's room marketplace
      </p>
      <p style={{ fontSize: 13, color: COLORS.txt3, textAlign: "center", marginBottom: 24 }}>
        Who are you?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <RoleCard
          roleKey="rentee"
          icon="🔍"
          title="Rentee"
          desc="Looking for a room or flat in the valley"
          perks={["Browse listings", "Save favourites", "Contact owners"]}
          accent={COLORS.gold}
          accentDim={COLORS.goldDim}
          accentBdr={COLORS.goldBdr}
          onSelect={onSelect}
        />
        <RoleCard
          roleKey="renter"
          icon="🏠"
          title="Renter"
          desc="Owner or agent listing rooms and flats"
          perks={["Post listings", "Manage inquiries", "View analytics"]}
          accent={COLORS.teal}
          accentDim={COLORS.tealDim}
          accentBdr={COLORS.tealBdr}
          onSelect={onSelect}
        />
      </div>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: COLORS.txt3 }}>
        Already have an account?{" "}
        <span
          onClick={() => onSelect("rentee")}
          style={{ color: COLORS.txt2, cursor: "pointer" }}
        >
          Sign in
        </span>
      </p>
    </div>
  );
}

// ── Login form ──────────────────────────────────────────────────────────────

function LoginForm({ role, accent, onSubmit }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <Field label="Phone number or email">
        <Input placeholder="98XXXXXXXX or name@email.com" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Password">
        <PasswordInput placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div style={{ fontSize: 12, color: COLORS.txt2, textAlign: "right", marginBottom: 14, cursor: "pointer" }}>
        Forgot password?
      </div>
      <button
        onClick={onSubmit}
        style={{
          width: "100%", padding: 12, border: "none", borderRadius: 10,
          background: accent, color: role === "rentee" ? "#1a0f00" : "#001a1a",
          fontSize: 14, fontWeight: 600, fontFamily: "'Sora', sans-serif", cursor: "pointer",
        }}
      >
        Sign in
      </button>
      <SocialRow />
    </div>
  );
}

// ── Sign-up form ────────────────────────────────────────────────────────────

function SignupForm({ role, accent, onSubmit }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", district: "", password: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      {role === "renter" && (
        <div style={{
          background: COLORS.card, border: `0.5px solid ${COLORS.bdr2}`, borderRadius: 10,
          padding: "12px 14px", marginBottom: 18, display: "flex", gap: 10,
        }}>
          <span style={{ fontSize: 16, color: COLORS.txt2, flexShrink: 0 }}>ℹ</span>
          <p style={{ fontSize: 12, color: COLORS.txt2, lineHeight: 1.55 }}>
            Renter accounts are verified by KothaFind. You'll need to upload a citizenship or property document after sign-up.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="First name">
          <Input placeholder="Aarav" value={form.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Last name">
          <Input placeholder="Shrestha" value={form.lastName} onChange={set("lastName")} />
        </Field>
      </div>

      <Field label="Phone number">
        <div style={{ display: "flex", gap: 8 }}>
          <Input value="+977" style={{ width: 72, flexShrink: 0 }} />
          <Input placeholder="98XXXXXXXX" value={form.phone} onChange={set("phone")} />
        </div>
      </Field>

      <Field label="Email address">
        <Input type="email" placeholder="aarav@email.com" value={form.email} onChange={set("email")} />
      </Field>

      {role === "renter" && (
        <Field label="District">
          <select
            value={form.district}
            onChange={set("district")}
            style={{
              width: "100%", background: COLORS.card, border: `0.5px solid ${COLORS.bdr2}`,
              borderRadius: 9, padding: "11px 14px", fontSize: 14, color: COLORS.txt2,
              fontFamily: "Inter, sans-serif", outline: "none",
            }}
          >
            <option value="" disabled>Select district</option>
            <option>Kathmandu</option>
            <option>Lalitpur</option>
            <option>Bhaktapur</option>
          </select>
        </Field>
      )}

      <Field label="Password">
        <PasswordInput placeholder="Min. 8 characters" value={form.password} onChange={set("password")} />
      </Field>

      <p style={{ fontSize: 11, color: COLORS.txt3, marginBottom: 14, lineHeight: 1.5 }}>
        By creating an account you agree to KothaFind's{" "}
        <span style={{ color: COLORS.txt2, cursor: "pointer" }}>Terms of Service</span> and{" "}
        <span style={{ color: COLORS.txt2, cursor: "pointer" }}>Privacy Policy</span>.
      </p>

      <button
        onClick={onSubmit}
        style={{
          width: "100%", padding: 12, border: "none", borderRadius: 10,
          background: accent, color: role === "rentee" ? "#1a0f00" : "#001a1a",
          fontSize: 14, fontWeight: 600, fontFamily: "'Sora', sans-serif", cursor: "pointer",
        }}
      >
        Create account
      </button>
      <SocialRow />
    </div>
  );
}

// ── Auth screen (login + signup tabs) ───────────────────────────────────────

function AuthScreen({ role, onBack, onSuccess }) {
  const [tab, setTab] = useState("login");
  const isRentee = role === "rentee";
  const accent = isRentee ? COLORS.gold : COLORS.teal;
  const accentDim = isRentee ? COLORS.goldDim : COLORS.tealDim;
  const accentBdr = isRentee ? COLORS.goldBdr : COLORS.tealBdr;

  const tagStyle = {
    display: "inline-block", fontSize: 11, fontWeight: 500,
    letterSpacing: "0.07em", textTransform: "uppercase",
    padding: "4px 10px", borderRadius: 5, marginBottom: 14,
    background: accentDim, color: accent, border: `0.5px solid ${accentBdr}`,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px" }}>
      <div style={tagStyle}>{isRentee ? "Rentee — room seeker" : "Renter — room owner"}</div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 5, color: COLORS.txt }}>
        {isRentee ? "Find your kotha" : "Manage your property"}
      </h2>
      <p style={{ fontSize: 13, color: COLORS.txt2, marginBottom: 24 }}>
        {isRentee
          ? "Sign in to browse rooms across Kathmandu Valley."
          : "Sign in to list rooms and manage inquiries."}
      </p>

      <div style={{
        display: "flex", background: COLORS.card, border: `0.5px solid ${COLORS.bdr2}`,
        borderRadius: 10, padding: 4, marginBottom: 24, gap: 4,
      }}>
        {["login", "signup"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: 8, border: tab === t ? `0.5px solid ${COLORS.bdr2}` : "none",
              background: tab === t ? COLORS.card2 : "none",
              borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
              color: tab === t ? COLORS.txt : COLORS.txt2,
              fontFamily: "Inter, sans-serif", transition: "all 0.15s",
            }}
          >
            {t === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      {tab === "login"
        ? <LoginForm role={role} accent={accent} onSubmit={onSuccess} />
        : <SignupForm role={role} accent={accent} onSubmit={onSuccess} />}

      <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: COLORS.txt3 }}>
        Not a {role}?{" "}
        <span onClick={onBack} style={{ color: COLORS.txt2, cursor: "pointer" }}>
          Switch role
        </span>
      </p>
    </div>
  );
}

// ── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ role, tab, onReset }) {
  const isRentee = role === "rentee";
  const accent = isRentee ? COLORS.gold : COLORS.teal;
  const accentDim = isRentee ? COLORS.goldDim : COLORS.tealDim;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{
        width: 60, height: 60, borderRadius: "50%", background: accentDim,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 26, color: accent,
      }}>
        ✓
      </div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 6, color: COLORS.txt }}>
        {tab === "login" ? "Welcome back!" : "Account created"}
      </h2>
      <p style={{ fontSize: 13, color: COLORS.txt2, marginBottom: 28, lineHeight: 1.6 }}>
        {isRentee
          ? "You're signed in as a rentee. Browse rooms across Kathmandu, Lalitpur and Bhaktapur."
          : tab === "signup"
          ? "Your renter account is pending verification. We'll review your documents within 24 hours."
          : "You're signed in as a renter. Manage your listings and respond to inquiries."}
      </p>
      <button
        onClick={onReset}
        style={{
          padding: "11px 32px", borderRadius: 10, border: "none",
          background: accent, color: isRentee ? "#1a0f00" : "#001a1a",
          fontSize: 14, fontWeight: 600, fontFamily: "'Sora', sans-serif", cursor: "pointer",
        }}
      >
        Go to dashboard →
      </button>
    </div>
  );
}

// ── Root app ─────────────────────────────────────────────────────────────────

export default function KothaFindAuth() {
  const [screen, setScreen] = useState("role"); // "role" | "auth" | "success"
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("login");

  const handleRoleSelect = (r) => { setRole(r); setScreen("auth"); };
  const handleSuccess = () => setScreen("success");
  const handleBack = () => setScreen("role");
  const handleReset = () => { setScreen("role"); setRole(null); };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: `0.5px solid ${COLORS.bdr}`, background: COLORS.surf,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Logo />
        {screen !== "role" && (
          <button
            onClick={screen === "success" ? handleReset : handleBack}
            style={{
              background: "none", border: `0.5px solid ${COLORS.bdr2}`, borderRadius: 8,
              color: COLORS.txt2, fontSize: 13, padding: "6px 14px", cursor: "pointer",
              fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: 6,
            }}
          >
            ← {screen === "success" ? "Start over" : "Back"}
          </button>
        )}
      </nav>

      {screen === "role" && <RoleScreen onSelect={handleRoleSelect} />}
      {screen === "auth" && (
        <AuthScreen role={role} onBack={handleBack} onSuccess={handleSuccess} />
      )}
      {screen === "success" && (
        <SuccessScreen role={role} tab={tab} onReset={handleReset} />
      )}
    </div>
  );
}
