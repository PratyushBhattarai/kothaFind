// ─────────────────────────────────────────────────────────────────────────────
// RenterDashboard.jsx  — main dashboard after onboarding
// Shows: stats (views/inquiries), rooms list, add room button
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

const BASE = import.meta.env.VITE_DJANGO_BASE;

async function apiFetch(path) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function apiPatch(path, body) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

const C = {
  bg:"#0D0F14", surf:"#141720", card:"#1A1E2A", card2:"#1F2435",
  bdr:"rgba(255,255,255,0.07)", bdr2:"rgba(255,255,255,0.13)",
  teal:"#2ABFBF", tealDim:"rgba(42,191,191,0.10)", tealBdr:"rgba(42,191,191,0.35)",
  gold:"#F5A623", goldDim:"rgba(245,166,35,0.10)",
  txt:"#E8E0D4", txt2:"#9A9590", txt3:"#5A5650",
  red:"#E8604C", green:"#4CAF7D",
};

function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Sora',sans-serif",
      fontWeight:700,fontSize:17,color:C.txt}}>
      <div style={{width:8,height:8,background:C.teal,borderRadius:"50%"}}/>
      Kotha<span style={{color:C.teal}}>Find</span>
      <span style={{fontSize:11,color:C.txt3,fontWeight:400,marginLeft:4}}>Dashboard</span>
    </div>
  );
}

function StatCard({label,value,sub,accent=C.teal}) {
  return (
    <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:12,padding:"16px 18px",flex:1}}>
      <div style={{fontSize:24,fontFamily:"'Sora',sans-serif",fontWeight:700,color:accent}}>{value}</div>
      <div style={{fontSize:12,color:C.txt,fontWeight:500,marginTop:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.txt3,marginTop:2}}>{sub}</div>}
    </div>
  );
}

function Badge({status}) {
  const map={
    available:{bg:"rgba(76,175,125,0.12)",color:"#4CAF7D",bdr:"rgba(76,175,125,0.3)",label:"Available"},
    rented:   {bg:"rgba(232,96,76,0.10)", color:C.red,   bdr:"rgba(232,96,76,0.3)", label:"Rented"},
    hidden:   {bg:"rgba(90,86,80,0.15)",  color:C.txt3,  bdr:C.bdr2,               label:"Hidden"},
  };
  const s=map[status]||map.available;
  return (
    <span style={{fontSize:11,padding:"3px 9px",borderRadius:5,
      background:s.bg,color:s.color,border:`0.5px solid ${s.bdr}`}}>
      {s.label}
    </span>
  );
}

function RoomCard({room, onToggleStatus}) {
  const [open,setOpen]=useState(false);
  const thumb=room.media?.[0];

  return (
    <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:12,overflow:"hidden",
      marginBottom:12,transition:"border-color 0.15s"}}>
      <div style={{display:"flex",gap:0}}>
        {/* thumbnail */}
        <div style={{width:110,flexShrink:0,background:C.card2,position:"relative"}}>
          {thumb
            ?<img src={thumb.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:24,color:C.txt3,minHeight:90}}>🏠</div>}
        </div>

        {/* info */}
        <div style={{flex:1,padding:"12px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
            <div>
              <p style={{fontSize:14,fontWeight:500,color:C.txt,marginBottom:3}}>{room.title}</p>
              <p style={{fontSize:12,color:C.txt2}}>{room.room_type_display} · Floor {room.floor}</p>
            </div>
            <Badge status={room.status}/>
          </div>

          <div style={{display:"flex",gap:16,marginBottom:8}}>
            <span style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:600,color:C.gold}}>
              रू {Number(room.price_per_month).toLocaleString()}<span style={{fontSize:11,color:C.txt3,fontWeight:400}}>/mo</span>
            </span>
          </div>

          {/* View count — the key metric */}
          <div style={{display:"flex",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:C.txt2}}>
              <span style={{color:C.teal}}>👁</span>
              <strong style={{color:C.txt}}>{room.view_count||0}</strong> views
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:C.txt2}}>
              <span>💬</span>
              <strong style={{color:C.txt}}>{room.inquiry_count||0}</strong> inquiries
            </div>
            {room.media?.length>0&&(
              <div style={{fontSize:12,color:C.txt3}}>
                📷 {room.media.length} photo{room.media.length>1?"s":""}
              </div>
            )}
          </div>
        </div>

        {/* expand */}
        <button type="button" onClick={()=>setOpen(o=>!o)}
          style={{width:36,background:"none",border:"none",borderLeft:`0.5px solid ${C.bdr}`,
            color:C.txt3,cursor:"pointer",fontSize:16}}>
          {open?"▲":"▼"}
        </button>
      </div>

      {/* expanded actions */}
      {open&&(
        <div style={{borderTop:`0.5px solid ${C.bdr}`,padding:"12px 14px",
          display:"flex",gap:8,flexWrap:"wrap"}}>
          {room.status==="available"&&(
            <button type="button" onClick={()=>onToggleStatus(room.id,"rented")}
              style={{fontSize:12,padding:"6px 14px",borderRadius:7,border:`0.5px solid ${C.bdr2}`,
                background:"none",color:C.txt2,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
              Mark as rented
            </button>
          )}
          {room.status==="rented"&&(
            <button type="button" onClick={()=>onToggleStatus(room.id,"available")}
              style={{fontSize:12,padding:"6px 14px",borderRadius:7,border:`0.5px solid rgba(76,175,125,0.3)`,
                background:"rgba(76,175,125,0.08)",color:C.green,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
              Mark as available
            </button>
          )}
          <button type="button" onClick={()=>onToggleStatus(room.id,room.status==="hidden"?"available":"hidden")}
            style={{fontSize:12,padding:"6px 14px",borderRadius:7,border:`0.5px solid ${C.bdr2}`,
              background:"none",color:C.txt2,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            {room.status==="hidden"?"Show listing":"Hide listing"}
          </button>
          <button type="button"
            style={{fontSize:12,padding:"6px 14px",borderRadius:7,border:`0.5px solid rgba(245,166,35,0.3)`,
              background:C.goldDim,color:C.gold,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            Edit room
          </button>
        </div>
      )}
    </div>
  );
}

export default function RenterDashboard({onAddRoom}) {
  const [rooms,  setRooms]  = useState([]);
  const [stats,  setStats]  = useState({total_views:0,total_inquiries:0,active_rooms:0,rented_rooms:0});
  const [tab,    setTab]    = useState("rooms"); // "rooms" | "profile"
  const [loading,setLoading]= useState(true);
  const user = auth.currentUser;

  useEffect(()=>{
    (async()=>{
      try {
        const [r,s]=await Promise.all([
          apiFetch("/renter/rooms/"),
          apiFetch("/renter/stats/"),
        ]);
        setRooms(r.results||r);
        setStats(s);
      } catch(e){ console.error(e); }
      finally{ setLoading(false); }
    })();
  },[]);

  const toggleStatus=async(id,status)=>{
    try {
      await apiPatch(`/renter/rooms/${id}/`,{status});
      setRooms(rs=>rs.map(r=>r.id===id?{...r,status}:r));
    } catch(e){ alert("Failed to update status."); }
  };

  const totalViews = rooms.reduce((s,r)=>s+(r.view_count||0),0);
  const totalInq   = rooms.reduce((s,r)=>s+(r.inquiry_count||0),0);

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>

      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 24px",borderBottom:`0.5px solid ${C.bdr}`,background:C.surf,
        position:"sticky",top:0,zIndex:10}}>
        <Logo/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:12,color:C.txt2}}>{user?.displayName||user?.email}</span>
          <button type="button" onClick={()=>signOut(auth)}
            style={{background:"none",border:`0.5px solid ${C.bdr2}`,borderRadius:8,
              color:C.txt3,fontSize:12,padding:"5px 12px",cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{maxWidth:720,margin:"0 auto",padding:"24px"}}>

        {/* Welcome */}
        <div style={{marginBottom:24}}>
          <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
            Welcome back, {(user?.displayName||"Renter").split(" ")[0]} 👋
          </h1>
          <p style={{fontSize:13,color:C.txt2}}>Here's how your listings are performing.</p>
        </div>

        {/* Stats row */}
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
          <StatCard label="Total room views" value={totalViews} sub="All time" accent={C.teal}/>
          <StatCard label="Inquiries received" value={totalInq} sub="All time" accent={C.gold}/>
          <StatCard label="Active listings" value={rooms.filter(r=>r.status==="available").length} accent={C.green}/>
          <StatCard label="Rented out" value={rooms.filter(r=>r.status==="rented").length} accent={C.red}/>
        </div>

        {/* Tab row */}
        <div style={{display:"flex",background:C.card,border:`0.5px solid ${C.bdr2}`,
          borderRadius:10,padding:4,marginBottom:20,gap:4,width:"fit-content"}}>
          {["rooms","profile"].map(t=>(
            <button key={t} type="button" onClick={()=>setTab(t)}
              style={{padding:"7px 20px",border:tab===t?`0.5px solid ${C.bdr2}`:"none",
                background:tab===t?C.card2:"none",borderRadius:7,fontSize:13,
                color:tab===t?C.txt:C.txt2,cursor:"pointer",fontFamily:"Inter,sans-serif",
                textTransform:"capitalize"}}>
              {t==="rooms"?"My Rooms":"Profile"}
            </button>
          ))}
        </div>

        {/* Rooms tab */}
        {tab==="rooms"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <p style={{fontSize:13,color:C.txt2}}>
                <strong style={{color:C.txt}}>{rooms.length}</strong> room{rooms.length!==1?"s":""} listed
              </p>
              <button type="button" onClick={onAddRoom}
                style={{padding:"8px 16px",background:C.teal,border:"none",borderRadius:8,
                  color:"#001a1a",fontSize:13,fontWeight:600,cursor:"pointer",
                  fontFamily:"'Sora',sans-serif"}}>
                + Add room
              </button>
            </div>

            {loading&&(
              <div style={{textAlign:"center",padding:40,color:C.txt3}}>Loading rooms…</div>
            )}

            {!loading&&rooms.length===0&&(
              <div style={{textAlign:"center",padding:40,background:C.card,
                border:`0.5px solid ${C.bdr2}`,borderRadius:12}}>
                <p style={{fontSize:22,marginBottom:8}}>🏠</p>
                <p style={{fontSize:14,color:C.txt,marginBottom:6}}>No rooms listed yet</p>
                <p style={{fontSize:12,color:C.txt3,marginBottom:16}}>Add your first room to start getting tenants</p>
                <button type="button" onClick={onAddRoom}
                  style={{padding:"10px 24px",background:C.teal,border:"none",borderRadius:9,
                    color:"#001a1a",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Sora',sans-serif"}}>
                  Add your first room
                </button>
              </div>
            )}

            {rooms.map(r=>(
              <RoomCard key={r.id} room={r} onToggleStatus={toggleStatus}/>
            ))}
          </div>
        )}

        {/* Profile tab */}
        {tab==="profile"&&(
          <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:12,padding:20}}>
            <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:16,color:C.txt,marginBottom:16}}>
              Your profile
            </h3>
            <div style={{display:"grid",gap:10}}>
              {[
                ["Name",    user?.displayName||"—"],
                ["Email",   user?.email||"—"],
                ["Account","Renter"],
              ].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",
                  padding:"10px 0",borderBottom:`0.5px solid ${C.bdr}`}}>
                  <span style={{fontSize:12,color:C.txt2}}>{k}</span>
                  <span style={{fontSize:13,color:C.txt}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:16,padding:"10px 14px",background:C.tealDim,
              border:`0.5px solid ${C.tealBdr}`,borderRadius:9}}>
              <p style={{fontSize:12,color:C.teal}}>
                ✓ Account active · To update location or contact, go to Settings (coming soon)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
