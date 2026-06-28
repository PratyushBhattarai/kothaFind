import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const C = {
  bg:"#0D0F14", surf:"#141720", card:"#1A1E2A", card2:"#1F2435",
  bdr:"rgba(255,255,255,0.07)", bdr2:"rgba(255,255,255,0.13)",
  gold:"#F5A623", goldDim:"rgba(245,166,35,0.12)", goldBdr:"rgba(245,166,35,0.35)",
  teal:"#2ABFBF", tealDim:"rgba(42,191,191,0.10)", tealBdr:"rgba(42,191,191,0.35)",
  txt:"#E8E0D4", txt2:"#9A9590", txt3:"#5A5650", red:"#E8604C",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function friendlyError(code) {
  if (["auth/user-not-found","auth/wrong-password","auth/invalid-credential"].includes(code))
    return "Incorrect email or password. Please try again.";
  if (code === "auth/email-already-in-use") return "An account with this email already exists. Try signing in.";
  if (code === "auth/invalid-email") return "Please enter a valid email address.";
  if (code === "auth/weak-password") return "Password must be at least 8 characters.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
  if (code === "auth/popup-closed-by-user") return "";
  return "Something went wrong. Please try again.";
}

// ── primitives ────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:C.txt}}>
      <div style={{width:8,height:8,background:C.gold,borderRadius:"50%"}}/>
      Kotha<span style={{color:C.gold}}>Find</span>
    </div>
  );
}

function Mandala({size=36}) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="none" stroke={C.gold} strokeWidth="1.5"/>
      <circle cx="100" cy="100" r="60" fill="none" stroke={C.gold} strokeWidth="1"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke={C.gold} strokeWidth="0.8"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke={C.gold} strokeWidth="0.8"/>
      <line x1="100" y1="10" x2="100" y2="190" stroke={C.gold} strokeWidth="0.8"/>
      <line x1="37" y1="37" x2="163" y2="163" stroke={C.gold} strokeWidth="0.6"/>
      <line x1="163" y1="37" x2="37" y2="163" stroke={C.gold} strokeWidth="0.6"/>
    </svg>
  );
}

function TextInput({type="text",placeholder,value,onChange,style={}}) {
  const [f,setF]=useState(false);
  return (
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{width:"100%",background:C.card,border:`0.5px solid ${f?"rgba(255,255,255,0.3)":C.bdr2}`,
        borderRadius:9,padding:"11px 14px",fontSize:14,color:C.txt,fontFamily:"Inter,sans-serif",
        outline:"none",transition:"border-color 0.15s",...style}}/>
  );
}

function PwInput({placeholder,value,onChange}) {
  const [show,setShow]=useState(false);
  const [f,setF]=useState(false);
  return (
    <div style={{position:"relative"}}>
      <input type={show?"text":"password"} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",background:C.card,border:`0.5px solid ${f?"rgba(255,255,255,0.3)":C.bdr2}`,
          borderRadius:9,padding:"11px 42px 11px 14px",fontSize:14,color:C.txt,
          fontFamily:"Inter,sans-serif",outline:"none"}}/>
      <button type="button" onClick={()=>setShow(!show)} aria-label={show?"Hide":"Show"}
        style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
          background:"none",border:"none",color:C.txt3,cursor:"pointer",fontSize:16}}>
        {show?"🙈":"👁"}
      </button>
    </div>
  );
}

function Field({label,error,children}) {
  return (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:6,fontWeight:500}}>{label}</label>
      {children}
      {error&&<p style={{fontSize:11,color:C.red,marginTop:4}}>{error}</p>}
    </div>
  );
}

function ErrorBanner({msg}) {
  if(!msg)return null;
  return(
    <div style={{background:"rgba(232,96,76,0.1)",border:"0.5px solid rgba(232,96,76,0.3)",
      borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.red}}>
      ⚠ {msg}
    </div>
  );
}

function GoogleBtn({onClick,loading}) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      style={{width:"100%",padding:"11px 0",background:C.card,border:`0.5px solid ${C.bdr2}`,
        borderRadius:9,color:C.txt2,fontSize:13,cursor:loading?"not-allowed":"pointer",
        fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",
        gap:10,opacity:loading?0.6:1}}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      {loading?"Connecting…":"Continue with Google"}
    </button>
  );
}

function Divider({label="or"}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
      <div style={{flex:1,height:"0.5px",background:C.bdr2}}/>
      <span style={{fontSize:11,color:C.txt3}}>{label}</span>
      <div style={{flex:1,height:"0.5px",background:C.bdr2}}/>
    </div>
  );
}

function SubmitBtn({accent,role,loading,children,onClick}) {
  return (
    <button type="button" onClick={onClick} disabled={loading}
      style={{width:"100%",padding:12,border:"none",borderRadius:10,background:accent,
        color:role==="rentee"?"#1a0f00":"#001a1a",fontSize:14,fontWeight:600,
        fontFamily:"'Sora',sans-serif",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}>
      {children}
    </button>
  );
}

// ── Role selector ─────────────────────────────────────────────────────────────

function RoleCard({roleKey,icon,title,desc,perks,accent,accentDim,accentBdr,onSelect}) {
  const [h,setH]=useState(false);
  return (
    <div onClick={()=>onSelect(roleKey)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{background:h?accentDim:C.card,border:`0.5px solid ${h?accentBdr:C.bdr2}`,
        borderRadius:14,padding:"24px 20px",cursor:"pointer",textAlign:"center",
        transition:"border-color 0.15s,background 0.15s"}}>
      <div style={{width:52,height:52,borderRadius:"50%",background:accentDim,display:"flex",
        alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:22}}>
        {icon}
      </div>
      <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:600,color:accent,marginBottom:6}}>{title}</h3>
      <p style={{fontSize:12,color:C.txt2,lineHeight:1.5,marginBottom:12}}>{desc}</p>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {perks.map(p=>(
          <div key={p} style={{fontSize:11,color:C.txt2,display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:accent}}>✓</span>{p}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleScreen({onSelect}) {
  return (
    <div style={{maxWidth:480,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{textAlign:"center",marginBottom:8}}><Mandala size={38}/></div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,textAlign:"center",marginBottom:5,color:C.txt}}>
        Welcome to KothaFind
      </h2>
      <p style={{fontSize:13,color:C.txt2,textAlign:"center",marginBottom:2}}>Kathmandu Valley's room marketplace</p>
      <p style={{fontSize:13,color:C.txt3,textAlign:"center",marginBottom:24}}>Who are you?</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <RoleCard roleKey="rentee" icon="🔍" title="Rentee"
          desc="Looking for a room or flat in the valley"
          perks={["Browse listings","Save favourites","Contact owners"]}
          accent={C.gold} accentDim={C.goldDim} accentBdr={C.goldBdr} onSelect={onSelect}/>
        <RoleCard roleKey="renter" icon="🏠" title="Renter"
          desc="Owner or agent listing rooms and flats"
          perks={["Post listings","Manage inquiries","View analytics"]}
          accent={C.teal} accentDim={C.tealDim} accentBdr={C.tealBdr} onSelect={onSelect}/>
      </div>
      <p style={{textAlign:"center",marginTop:16,fontSize:12,color:C.txt3}}>
        Already have an account?{" "}
        <span onClick={()=>onSelect("rentee")} style={{color:C.txt2,cursor:"pointer"}}>Sign in</span>
      </p>
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({role,accent,onSuccess}) {
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [gLoad,setGLoad]=useState(false);

  const handleEmail=async()=>{
    setErr("");
    if(!email||!pw){setErr("Please fill in all fields.");return;}
    setLoading(true);
    try{
      const c=await signInWithEmailAndPassword(auth,email,pw);
      onSuccess({user:c.user,method:"email",role,isNew:false});
    }catch(e){setErr(friendlyError(e.code));}
    finally{setLoading(false);}
  };

  const handleGoogle=async()=>{
    setErr("");setGLoad(true);
    try{
      const c=await signInWithPopup(auth,googleProvider);
      onSuccess({user:c.user,method:"google",role,isNew:false});
    }catch(e){const m=friendlyError(e.code);if(m)setErr(m);}
    finally{setGLoad(false);}
  };

  return(
    <div>
      <GoogleBtn onClick={handleGoogle} loading={gLoad}/>
      <Divider label="or sign in with email"/>
      <ErrorBanner msg={err}/>
      <Field label="Email address">
        <TextInput type="email" placeholder="aarav@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
      </Field>
      <Field label="Password">
        <PwInput placeholder="Enter your password" value={pw} onChange={e=>setPw(e.target.value)}/>
      </Field>
      <div style={{fontSize:12,color:C.txt2,textAlign:"right",marginBottom:16,cursor:"pointer"}}>
        Forgot password?
      </div>
      <SubmitBtn accent={accent} role={role} loading={loading} onClick={handleEmail}>
        {loading?"Signing in…":"Sign in with email"}
      </SubmitBtn>
    </div>
  );
}

// ── Sign-up form ──────────────────────────────────────────────────────────────

function SignupForm({role,accent,onSuccess}) {
  const [form,setForm]=useState({firstName:"",lastName:"",phone:"",email:"",district:"",password:"",confirm:""});
  const [errs,setErrs]=useState({});
  const [gErr,setGErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [gLoad,setGLoad]=useState(false);

  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));

  const validate=()=>{
    const e={};
    if(!form.firstName.trim())e.firstName="Required";
    if(!form.lastName.trim())e.lastName="Required";
    if(!/\S+@\S+\.\S+/.test(form.email))e.email="Valid email required";
    if(form.password.length<8)e.password="Min. 8 characters";
    if(form.password!==form.confirm)e.confirm="Passwords don't match";
    if(role==="renter"&&!form.district)e.district="Please select a district";
    return e;
  };

  const handleEmail=async()=>{
    setGErr("");
    const e=validate();
    if(Object.keys(e).length){setErrs(e);return;}
    setErrs({});setLoading(true);
    try{
      const c=await createUserWithEmailAndPassword(auth,form.email,form.password);
      await updateProfile(c.user,{displayName:`${form.firstName} ${form.lastName}`});
      onSuccess({user:c.user,method:"email",role,isNew:true});
    }catch(err){setGErr(friendlyError(err.code));}
    finally{setLoading(false);}
  };

  const handleGoogle=async()=>{
    setGErr("");setGLoad(true);
    try{
      const c=await signInWithPopup(auth,googleProvider);
      onSuccess({user:c.user,method:"google",role,isNew:true});
    }catch(e){const m=friendlyError(e.code);if(m)setGErr(m);}
    finally{setGLoad(false);}
  };

  return(
    <div>
      <GoogleBtn onClick={handleGoogle} loading={gLoad}/>
      <Divider label="or create account with email"/>

      {role==="renter"&&(
        <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:10,
          padding:"12px 14px",marginBottom:18,display:"flex",gap:10}}>
          <span style={{fontSize:15,color:C.txt2,flexShrink:0}}>ℹ</span>
          <p style={{fontSize:12,color:C.txt2,lineHeight:1.55}}>
            Renter accounts are verified by KothaFind. Upload citizenship or property documents after sign-up.
          </p>
        </div>
      )}

      <ErrorBanner msg={gErr}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="First name" error={errs.firstName}>
          <TextInput placeholder="Aarav" value={form.firstName} onChange={set("firstName")}/>
        </Field>
        <Field label="Last name" error={errs.lastName}>
          <TextInput placeholder="Shrestha" value={form.lastName} onChange={set("lastName")}/>
        </Field>
      </div>

      <Field label="Phone number">
        <div style={{display:"flex",gap:8}}>
          <TextInput value="+977" style={{width:72,flexShrink:0}}/>
          <TextInput type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={set("phone")}/>
        </div>
      </Field>

      <Field label="Email address" error={errs.email}>
        <TextInput type="email" placeholder="aarav@email.com" value={form.email} onChange={set("email")}/>
      </Field>

      {role==="renter"&&(
        <Field label="District" error={errs.district}>
          <select value={form.district} onChange={set("district")}
            style={{width:"100%",background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:9,
              padding:"11px 14px",fontSize:14,color:C.txt2,fontFamily:"Inter,sans-serif",outline:"none"}}>
            <option value="" disabled>Select district</option>
            <option>Kathmandu</option>
            <option>Lalitpur</option>
            <option>Bhaktapur</option>
          </select>
        </Field>
      )}

      <Field label="Password" error={errs.password}>
        <PwInput placeholder="Min. 8 characters" value={form.password} onChange={set("password")}/>
      </Field>

      <Field label="Confirm password" error={errs.confirm}>
        <PwInput placeholder="Re-enter password" value={form.confirm} onChange={set("confirm")}/>
      </Field>

      <p style={{fontSize:11,color:C.txt3,marginBottom:14,lineHeight:1.5}}>
        By creating an account you agree to KothaFind's{" "}
        <span style={{color:C.txt2,cursor:"pointer"}}>Terms of Service</span> and{" "}
        <span style={{color:C.txt2,cursor:"pointer"}}>Privacy Policy</span>.
      </p>

      <SubmitBtn accent={accent} role={role} loading={loading} onClick={handleEmail}>
        {loading?"Creating account…":"Create account"}
      </SubmitBtn>
    </div>
  );
}

// ── Auth screen ───────────────────────────────────────────────────────────────

function AuthScreen({role,onBack,onSuccess}) {
  const [tab,setTab]=useState("login");
  const isR=role==="rentee";
  const accent=isR?C.gold:C.teal;
  const accentDim=isR?C.goldDim:C.tealDim;
  const accentBdr=isR?C.goldBdr:C.tealBdr;

  return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"32px 24px"}}>
      <div style={{display:"inline-block",fontSize:11,fontWeight:500,letterSpacing:"0.07em",
        textTransform:"uppercase",padding:"4px 10px",borderRadius:5,marginBottom:14,
        background:accentDim,color:accent,border:`0.5px solid ${accentBdr}`}}>
        {isR?"Rentee — room seeker":"Renter — room owner"}
      </div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,marginBottom:5,color:C.txt}}>
        {isR?"Find your kotha":"Manage your property"}
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:24}}>
        {isR?"Sign in to browse rooms across Kathmandu Valley.":"Sign in to list rooms and manage inquiries."}
      </p>

      <div style={{display:"flex",background:C.card,border:`0.5px solid ${C.bdr2}`,
        borderRadius:10,padding:4,marginBottom:24,gap:4}}>
        {["login","signup"].map(t=>(
          <button key={t} type="button" onClick={()=>setTab(t)}
            style={{flex:1,padding:8,border:tab===t?`0.5px solid ${C.bdr2}`:"none",
              background:tab===t?C.card2:"none",borderRadius:7,fontSize:13,fontWeight:500,
              cursor:"pointer",color:tab===t?C.txt:C.txt2,fontFamily:"Inter,sans-serif",transition:"all 0.15s"}}>
            {t==="login"?"Sign in":"Create account"}
          </button>
        ))}
      </div>

      {tab==="login"
        ?<LoginForm role={role} accent={accent} onSuccess={onSuccess}/>
        :<SignupForm role={role} accent={accent} onSuccess={onSuccess}/>}

      <p style={{textAlign:"center",marginTop:20,fontSize:12,color:C.txt3}}>
        Not a {role}?{" "}
        <span onClick={onBack} style={{color:C.txt2,cursor:"pointer"}}>Switch role</span>
      </p>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessScreen({role,authInfo,onReset}) {
  const isR=role==="rentee";
  const accent=isR?C.gold:C.teal;
  const accentDim=isR?C.goldDim:C.tealDim;
  const first=(authInfo?.user?.displayName||"there").split(" ")[0];

  return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"60px 24px",textAlign:"center"}}>
      <div style={{width:60,height:60,borderRadius:"50%",background:accentDim,display:"flex",
        alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:26,color:accent}}>
        ✓
      </div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,marginBottom:6,color:C.txt}}>
        {authInfo?.isNew?`Welcome, ${first}!`:`Welcome back, ${first}!`}
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:6}}>
        Signed in as <strong style={{color:C.txt}}>{authInfo?.user?.email}</strong>
      </p>
      <p style={{fontSize:13,color:C.txt2,marginBottom:28,lineHeight:1.6}}>
        {isR
          ?"Browse rooms across Kathmandu, Lalitpur and Bhaktapur."
          :authInfo?.isNew
            ?"Your renter account is pending verification. We'll review your documents within 24 hours."
            :"Manage your listings and respond to inquiries."}
      </p>
      <button type="button" onClick={onReset}
        style={{padding:"11px 32px",borderRadius:10,border:"none",background:accent,
          color:isR?"#1a0f00":"#001a1a",fontSize:14,fontWeight:600,
          fontFamily:"'Sora',sans-serif",cursor:"pointer"}}>
        Go to dashboard →
      </button>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function KothaFindAuth() {
  const [screen,setScreen]=useState("role");
  const [role,setRole]=useState(null);
  const [authInfo,setAuthInfo]=useState(null);

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 24px",borderBottom:`0.5px solid ${C.bdr}`,background:C.surf,
        position:"sticky",top:0,zIndex:10}}>
        <Logo/>
        {screen!=="role"&&(
          <button type="button"
            onClick={()=>{
              if(screen==="success"){setScreen("role");setRole(null);setAuthInfo(null);}
              else setScreen("role");
            }}
            style={{background:"none",border:`0.5px solid ${C.bdr2}`,borderRadius:8,
              color:C.txt2,fontSize:13,padding:"6px 14px",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            ← {screen==="success"?"Start over":"Back"}
          </button>
        )}
      </nav>

      {screen==="role"&&(
        <RoleScreen onSelect={r=>{setRole(r);setScreen("auth");}}/>
      )}
      {screen==="auth"&&(
        <AuthScreen role={role} onBack={()=>setScreen("role")}
          onSuccess={info=>{setAuthInfo(info);setScreen("success");}}/>
      )}
      {screen==="success"&&(
        <SuccessScreen role={role} authInfo={authInfo}
          onReset={()=>{setScreen("role");setRole(null);setAuthInfo(null);}}/>
      )}
    </div>
  );
}
