// ─────────────────────────────────────────────────────────────────────────────
// RenterOnboarding.jsx
// Step-by-step onboarding shown once after renter signs up
// Steps: 1) Location  2) Contact  3) Property details  4) Add room  5) T&C
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import { auth } from "./firebase";

const BASE = import.meta.env.VITE_DJANGO_BASE
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

async function apiPost(path, body) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPostForm(path, formData) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#0D0F14", surf:"#141720", card:"#1A1E2A", card2:"#1F2435",
  bdr:"rgba(255,255,255,0.07)", bdr2:"rgba(255,255,255,0.13)",
  teal:"#2ABFBF", tealDim:"rgba(42,191,191,0.10)", tealBdr:"rgba(42,191,191,0.35)",
  gold:"#F5A623", goldDim:"rgba(245,166,35,0.10)",
  txt:"#E8E0D4", txt2:"#9A9590", txt3:"#5A5650",
  red:"#E8604C", green:"#4CAF7D",
};

// ── Shared primitives ─────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:7,fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:17,color:C.txt}}>
      <div style={{width:8,height:8,background:C.teal,borderRadius:"50%"}}/>
      Kotha<span style={{color:C.teal}}>Find</span>
      <span style={{fontSize:11,color:C.txt3,fontWeight:400,marginLeft:4}}>Renter Portal</span>
    </div>
  );
}

function TextInput({label,placeholder,value,onChange,error,type="text",style={}}) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:6,fontWeight:500}}>{label}</label>}
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",background:C.card,border:`0.5px solid ${f?"rgba(255,255,255,0.28)":error?C.red:C.bdr2}`,
          borderRadius:9,padding:"11px 14px",fontSize:14,color:C.txt,fontFamily:"Inter,sans-serif",
          outline:"none",transition:"border-color 0.15s",...style}}/>
      {error&&<p style={{fontSize:11,color:C.red,marginTop:4}}>{error}</p>}
    </div>
  );
}

function Textarea({label,placeholder,value,onChange,rows=4}) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:6,fontWeight:500}}>{label}</label>}
      <textarea placeholder={placeholder} value={value} onChange={onChange} rows={rows}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{width:"100%",background:C.card,border:`0.5px solid ${f?"rgba(255,255,255,0.28)":C.bdr2}`,
          borderRadius:9,padding:"11px 14px",fontSize:14,color:C.txt,fontFamily:"Inter,sans-serif",
          outline:"none",resize:"vertical",lineHeight:1.6}}/>
    </div>
  );
}

function Select({label,value,onChange,children,error}) {
  return (
    <div style={{marginBottom:14}}>
      {label&&<label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:6,fontWeight:500}}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{width:"100%",background:C.card,border:`0.5px solid ${error?C.red:C.bdr2}`,borderRadius:9,
          padding:"11px 14px",fontSize:14,color:C.txt2,fontFamily:"Inter,sans-serif",outline:"none"}}>
        {children}
      </select>
      {error&&<p style={{fontSize:11,color:C.red,marginTop:4}}>{error}</p>}
    </div>
  );
}

function PrimaryBtn({onClick,loading,children,disabled=false}) {
  return (
    <button type="button" onClick={onClick} disabled={loading||disabled}
      style={{width:"100%",padding:12,border:"none",borderRadius:10,background:C.teal,
        color:"#001a1a",fontSize:14,fontWeight:600,fontFamily:"'Sora',sans-serif",
        cursor:loading||disabled?"not-allowed":"pointer",opacity:loading||disabled?0.6:1}}>
      {loading?"Please wait…":children}
    </button>
  );
}

function SecondaryBtn({onClick,children}) {
  return (
    <button type="button" onClick={onClick}
      style={{width:"100%",padding:11,border:`0.5px solid ${C.bdr2}`,borderRadius:10,
        background:"none",color:C.txt2,fontSize:14,fontFamily:"Inter,sans-serif",cursor:"pointer",marginTop:8}}>
      {children}
    </button>
  );
}

function ErrorBanner({msg}) {
  if(!msg) return null;
  return (
    <div style={{background:"rgba(232,96,76,0.1)",border:"0.5px solid rgba(232,96,76,0.3)",
      borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.red}}>
      ⚠ {msg}
    </div>
  );
}

// ── Step progress bar ─────────────────────────────────────────────────────────
const STEPS = ["Location","Contact","Property","Add Room","Terms"];

function StepBar({current}) {
  return (
    <div style={{padding:"20px 24px 0",maxWidth:640,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:0}}>
        {STEPS.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",flex:i<STEPS.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:12,fontWeight:600,
                background:i<current?C.teal:i===current?C.tealDim:"transparent",
                border:`0.5px solid ${i<=current?C.teal:C.bdr2}`,
                color:i<current?"#001a1a":i===current?C.teal:C.txt3}}>
                {i<current?"✓":i+1}
              </div>
              <span style={{fontSize:10,color:i===current?C.teal:C.txt3,whiteSpace:"nowrap"}}>{s}</span>
            </div>
            {i<STEPS.length-1&&(
              <div style={{flex:1,height:"0.5px",background:i<current?C.teal:C.bdr2,margin:"0 4px",marginBottom:16}}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Location (MapTiler + Leaflet)
// ─────────────────────────────────────────────────────────────────────────────
function StepLocation({onNext}) {
  const mapRef    = useRef(null);
  const mapObj    = useRef(null);
  const markerRef = useRef(null);
  const [coords,   setCoords]   = useState(null);
  const [address,  setAddress]  = useState("");
  const [ward,     setWard]     = useState("");
  const [tole,     setTole]     = useState("");
  const [district, setDistrict] = useState("Kathmandu");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  // ── Init MapTiler + Leaflet ─────────────────────────────────────────────────
  useEffect(()=>{
    if(mapObj.current) return;

    // inject Leaflet CSS once
    if(!document.getElementById("leaflet-css")){
      const link=document.createElement("link");
      link.id="leaflet-css";
      link.rel="stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L)=>{
      const Lf = L.default||L;

      const map = Lf.map(mapRef.current,{
        center:[27.7172,85.3240], zoom:13,
      });

      // MapTiler dark tiles
      Lf.tileLayer(
        `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
        {
          attribution:'© <a href="https://www.maptiler.com/">MapTiler</a>',
          tileSize:512, zoomOffset:-1, maxZoom:20,
        }
      ).addTo(map);

      const makeIcon = ()=> Lf.divIcon({
        className:"",
        html:`<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;
          background:#2ABFBF;border:2px solid #0D0F14;transform:rotate(-45deg)"></div>`,
        iconSize:[18,18], iconAnchor:[9,18],
      });

      const reverseGeocode = async (lat,lng)=>{
        try{
          const r=await fetch(
            `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`
          );
          const d=await r.json();
          setAddress(d.features?.[0]?.place_name||"");
        }catch{ setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); }
      };

      map.on("click",(e)=>{
        const {lat,lng}=e.latlng;
        setCoords({lat,lng});
        if(markerRef.current) markerRef.current.remove();
        markerRef.current=Lf.marker([lat,lng],{icon:makeIcon()}).addTo(map);
        reverseGeocode(lat,lng);
      });

      mapObj.current=map;
    });

    return ()=>{
      if(mapObj.current){ mapObj.current.remove(); mapObj.current=null; }
    };
  },[]);

  const useMyLocation=()=>{
    if(!navigator.geolocation){setErr("Geolocation not supported.");return;}
    navigator.geolocation.getCurrentPosition(async pos=>{
      const lat=pos.coords.latitude, lng=pos.coords.longitude;
      setCoords({lat,lng});
      mapObj.current?.setView([lat,lng],17);
      import("leaflet").then((L)=>{
        const Lf=L.default||L;
        const icon=Lf.divIcon({
          className:"",
          html:`<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;
            background:#2ABFBF;border:2px solid #0D0F14;transform:rotate(-45deg)"></div>`,
          iconSize:[18,18],iconAnchor:[9,18],
        });
        if(markerRef.current) markerRef.current.remove();
        markerRef.current=Lf.marker([lat,lng],{icon}).addTo(mapObj.current);
      });
      try{
        const r=await fetch(
          `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`
        );
        const d=await r.json();
        setAddress(d.features?.[0]?.place_name||"");
      }catch{ setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); }
    },()=>setErr("Could not get your location."));
  };

  const handleNext=async()=>{
    if(!coords){setErr("Please pin your property location on the map.");return;}
    if(!ward.trim()){setErr("Please enter your ward number.");return;}
    setErr(""); setLoading(true);
    try{
      await apiPost("/renter/location/",{
        latitude:coords.lat, longitude:coords.lng,
        address, ward, tole, district,
      });
      onNext({coords,address,ward,tole,district});
    }catch{ setErr("Failed to save location. Please try again."); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
        Pin your property location
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:16}}>
        Click the map to mark your exact property location, or use your current location.
      </p>

      {/* Map */}
      <div style={{borderRadius:12,overflow:"hidden",border:`0.5px solid ${C.bdr2}`,
        marginBottom:12,height:300}}>
        <div ref={mapRef} style={{width:"100%",height:"100%",background:C.card}}/>
      </div>

      <button type="button" onClick={useMyLocation}
        style={{width:"100%",padding:"9px 0",marginBottom:14,background:C.goldDim,
          border:`0.5px solid rgba(245,166,35,0.3)`,borderRadius:9,color:C.gold,
          fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        📍 Use my current location
      </button>

      {coords&&(
        <div style={{background:C.card,border:`0.5px solid ${C.tealBdr}`,borderRadius:9,
          padding:"10px 14px",marginBottom:14,fontSize:12,color:C.teal}}>
          ✓ Pinned: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          {address&&<div style={{color:C.txt2,marginTop:3,fontSize:11}}>{address}</div>}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <TextInput label="Ward No. *" placeholder="e.g. 12"
          value={ward} onChange={e=>setWard(e.target.value)}/>
        <TextInput label="Tole / Colony" placeholder="e.g. New Baneshwor"
          value={tole} onChange={e=>setTole(e.target.value)}/>
      </div>
      <Select label="District" value={district} onChange={e=>setDistrict(e.target.value)}>
        <option>Kathmandu</option>
        <option>Lalitpur</option>
        <option>Bhaktapur</option>
      </Select>

      <ErrorBanner msg={err}/>
      <PrimaryBtn onClick={handleNext} loading={loading}>Save location & continue →</PrimaryBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Contact info
// ─────────────────────────────────────────────────────────────────────────────
function StepContact({onNext}) {
  const [phone,    setPhone]    = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email,    setEmail]    = useState(auth.currentUser?.email||"");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const handleNext=async()=>{
    if(!phone.trim()){setErr("Primary phone number is required.");return;}
    setErr(""); setLoading(true);
    try {
      await apiPost("/renter/contact/",{phone,alt_phone:altPhone,whatsapp,email});
      onNext({phone,altPhone,whatsapp,email});
    } catch(e){ setErr("Failed to save contact. Please try again."); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
        Contact information
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:20}}>
        Tenants will use this to reach you. Your primary phone is required.
      </p>

      <div style={{display:"flex",gap:8,marginBottom:0}}>
        <div style={{width:72,flexShrink:0}}>
          <TextInput label="Code" value="+977" onChange={()=>{}}/>
        </div>
        <div style={{flex:1}}>
          <TextInput label="Primary phone *" placeholder="98XXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)}/>
        </div>
      </div>

      <div style={{display:"flex",gap:8}}>
        <div style={{width:72,flexShrink:0}}>
          <TextInput label="Code" value="+977" onChange={()=>{}}/>
        </div>
        <div style={{flex:1}}>
          <TextInput label="Alternate phone" placeholder="97XXXXXXXX" value={altPhone} onChange={e=>setAltPhone(e.target.value)}/>
        </div>
      </div>

      <TextInput label="WhatsApp number (optional)" placeholder="Same as primary or different"
        value={whatsapp} onChange={e=>setWhatsapp(e.target.value)}/>
      <TextInput label="Email" type="email" placeholder="you@email.com"
        value={email} onChange={e=>setEmail(e.target.value)}/>

      <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:9,
        padding:"10px 14px",marginBottom:14,fontSize:12,color:C.txt2,lineHeight:1.6}}>
        ℹ Your contact details are only shared with tenants who enquire about your listing.
      </div>

      <ErrorBanner msg={err}/>
      <PrimaryBtn onClick={handleNext} loading={loading}>Save contact & continue →</PrimaryBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Property details
// ─────────────────────────────────────────────────────────────────────────────
function StepProperty({onNext}) {
  const [name,        setName]        = useState("");
  const [type,        setType]        = useState("house");
  const [floors,      setFloors]      = useState("1");
  const [yearBuilt,   setYearBuilt]   = useState("");
  const [description, setDescription] = useState("");
  const [amenities,   setAmenities]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState("");

  const ALL_AMENITIES = [
    "Parking","Water 24/7","Solar backup","Internet ready","CCTV",
    "Lift","Generator","Garden","Rooftop access","Security guard",
  ];

  const toggleAmenity=a=>setAmenities(prev=>
    prev.includes(a)?prev.filter(x=>x!==a):[...prev,a]
  );

  const handleNext=async()=>{
    if(!name.trim()){setErr("Property name is required.");return;}
    if(!description.trim()){setErr("Please add a short description.");return;}
    setErr(""); setLoading(true);
    try {
      const data=await apiPost("/renter/property/",{
        name, type, floors:parseInt(floors), year_built:yearBuilt||null,
        description, amenities,
      });
      onNext({propertyId:data.id, name});
    } catch(e){ setErr("Failed to save property. Please try again."); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
        Property details
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:20}}>
        Tell tenants about your property building.
      </p>

      <TextInput label="Property / building name *" placeholder='e.g. "Shrestha Sadan"'
        value={name} onChange={e=>setName(e.target.value)}/>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Select label="Property type" value={type} onChange={e=>setType(e.target.value)}>
          <option value="house">House</option>
          <option value="flat">Apartment / Flat</option>
          <option value="commercial">Commercial</option>
        </Select>
        <TextInput label="No. of floors" type="number" placeholder="1"
          value={floors} onChange={e=>setFloors(e.target.value)}/>
      </div>

      <TextInput label="Year built (optional)" type="number" placeholder="e.g. 2015"
        value={yearBuilt} onChange={e=>setYearBuilt(e.target.value)}/>

      <Textarea label="Description *" placeholder="Describe the building, surroundings, nearby landmarks…"
        value={description} onChange={e=>setDescription(e.target.value)} rows={4}/>

      <div style={{marginBottom:14}}>
        <label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:8,fontWeight:500}}>
          Building amenities
        </label>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {ALL_AMENITIES.map(a=>(
            <button key={a} type="button" onClick={()=>toggleAmenity(a)}
              style={{fontSize:12,padding:"5px 12px",borderRadius:20,cursor:"pointer",
                fontFamily:"Inter,sans-serif",transition:"all 0.12s",
                background:amenities.includes(a)?C.tealDim:"none",
                border:`0.5px solid ${amenities.includes(a)?C.tealBdr:C.bdr2}`,
                color:amenities.includes(a)?C.teal:C.txt2}}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner msg={err}/>
      <PrimaryBtn onClick={handleNext} loading={loading}>Save property & continue →</PrimaryBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Add room(s)
// ─────────────────────────────────────────────────────────────────────────────
function StepAddRoom({propertyId, onNext}) {
  const [rooms,   setRooms]   = useState([]);
  const [form,    setForm]    = useState({
    title:"", type:"single", floor:"1", size:"", price:"",
    description:"", features:[],
  });
  const [files,    setFiles]   = useState([]);   // images + videos
  const [previews, setPreviews]= useState([]);
  const [loading,  setLoading] = useState(false);
  const [err,      setErr]     = useState("");
  const fileRef = useRef(null);

  const ROOM_FEATURES = [
    "Attached bathroom","Furnished","WiFi included","AC","Balcony",
    "Window with view","Quiet floor","Near entrance","Natural light",
  ];

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const toggleFeat = f => setForm(prev=>({
    ...prev,
    features:prev.features.includes(f)
      ?prev.features.filter(x=>x!==f)
      :[...prev.features,f],
  }));

  const handleFiles=e=>{
    const chosen=[...e.target.files];
    setFiles(chosen);
    setPreviews(chosen.map(f=>({url:URL.createObjectURL(f),type:f.type})));
  };

  const handleAddRoom=async()=>{
    if(!form.title.trim()){setErr("Room title is required.");return;}
    if(!form.price){setErr("Please enter a monthly price.");return;}
    setErr(""); setLoading(true);
    try {
      const fd=new FormData();
      fd.append("property",propertyId);
      fd.append("title",form.title);
      fd.append("room_type",form.type);
      fd.append("floor",form.floor);
      fd.append("size_sqft",form.size||"");
      fd.append("price_per_month",form.price);
      fd.append("description",form.description);
      fd.append("features",JSON.stringify(form.features));
      files.forEach(f=>fd.append("media",f));
      const data=await apiPostForm("/renter/rooms/",fd);
      setRooms(r=>[...r,data]);
      setForm({title:"",type:"single",floor:"1",size:"",price:"",description:"",features:[]});
      setFiles([]); setPreviews([]);
    } catch(e){ setErr("Failed to add room. Please try again."); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
        Add your room(s)
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:20}}>
        Add each available room with price and photos. You can add more rooms later.
      </p>

      {/* Added rooms */}
      {rooms.length>0&&(
        <div style={{marginBottom:20}}>
          <p style={{fontSize:12,color:C.txt2,marginBottom:8}}>Added rooms ({rooms.length})</p>
          {rooms.map((r,i)=>(
            <div key={i} style={{background:C.card,border:`0.5px solid ${C.tealBdr}`,
              borderRadius:9,padding:"10px 14px",marginBottom:8,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <p style={{fontSize:13,color:C.txt,fontWeight:500}}>{r.title}</p>
                <p style={{fontSize:11,color:C.txt2}}>रू {Number(r.price_per_month).toLocaleString()}/mo</p>
              </div>
              <span style={{fontSize:11,color:C.teal}}>✓ Saved</span>
            </div>
          ))}
        </div>
      )}

      {/* Room form */}
      <div style={{background:C.card2,border:`0.5px solid ${C.bdr2}`,borderRadius:12,padding:16,marginBottom:14}}>
        <p style={{fontSize:12,color:C.teal,fontWeight:500,marginBottom:12}}>
          {rooms.length===0?"First room":"Add another room"}
        </p>

        <TextInput label="Room title *" placeholder='e.g. "Bright single room on 2nd floor"'
          value={form.title} onChange={set("title")}/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Select label="Room type" value={form.type} onChange={set("type")}>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="1bhk">1 BHK</option>
            <option value="2bhk">2 BHK</option>
            <option value="studio">Studio</option>
          </Select>
          <TextInput label="Floor no." type="number" placeholder="1"
            value={form.floor} onChange={set("floor")}/>
          <TextInput label="Size (sq.ft)" type="number" placeholder="200"
            value={form.size} onChange={set("size")}/>
        </div>

        <TextInput label="Monthly rent (रू) *" type="number" placeholder="e.g. 12000"
          value={form.price} onChange={set("price")}/>

        <Textarea label="Room description" placeholder="Describe the room — furnishings, views, light…"
          value={form.description} onChange={set("description")} rows={3}/>

        {/* Features */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:8,fontWeight:500}}>Room features</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {ROOM_FEATURES.map(f=>(
              <button key={f} type="button" onClick={()=>toggleFeat(f)}
                style={{fontSize:11,padding:"4px 10px",borderRadius:6,cursor:"pointer",
                  fontFamily:"Inter,sans-serif",
                  background:form.features.includes(f)?C.goldDim:"none",
                  border:`0.5px solid ${form.features.includes(f)?"rgba(245,166,35,0.3)":C.bdr2}`,
                  color:form.features.includes(f)?C.gold:C.txt2}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Media upload */}
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:12,color:C.txt2,marginBottom:8,fontWeight:500}}>
            Photos & videos
          </label>
          <div onClick={()=>fileRef.current?.click()}
            style={{border:`1px dashed ${C.bdr2}`,borderRadius:9,padding:"20px",
              textAlign:"center",cursor:"pointer",background:"rgba(255,255,255,0.02)"}}>
            <p style={{fontSize:13,color:C.txt3,marginBottom:4}}>📷 Click to upload photos or videos</p>
            <p style={{fontSize:11,color:C.txt3}}>JPG, PNG, MP4 supported · Max 20MB each</p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*"
            onChange={handleFiles} style={{display:"none"}}/>
          {previews.length>0&&(
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              {previews.map((p,i)=>(
                <div key={i} style={{width:72,height:72,borderRadius:8,overflow:"hidden",
                  border:`0.5px solid ${C.bdr2}`,position:"relative"}}>
                  {p.type.startsWith("video")
                    ?<video src={p.url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<img src={p.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                </div>
              ))}
            </div>
          )}
        </div>

        <ErrorBanner msg={err}/>
        <PrimaryBtn onClick={handleAddRoom} loading={loading}>
          {rooms.length===0?"Add this room":"Add another room"}
        </PrimaryBtn>
      </div>

      {rooms.length>0&&(
        <PrimaryBtn onClick={()=>onNext({rooms})} loading={false}>
          Continue with {rooms.length} room{rooms.length>1?"s":""} →
        </PrimaryBtn>
      )}
      {rooms.length===0&&(
        <p style={{textAlign:"center",fontSize:12,color:C.txt3,marginTop:8}}>
          Add at least one room to continue
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — Terms & Conditions
// ─────────────────────────────────────────────────────────────────────────────
const TERMS_TEXT = `1. ACCURACY OF INFORMATION
You confirm that all property details, photos, pricing, and contact information you provide are accurate and truthful. KothaFind reserves the right to remove listings found to be misleading or fraudulent.

2. LISTING RESPONSIBILITY
You are solely responsible for your listing content. KothaFind acts only as a platform and does not verify every listing. Listings must comply with all applicable laws of Nepal.

3. CONTACT & PRIVACY
Your contact details will be visible to prospective tenants who enquire about your rooms. Do not share details of other parties without their consent.

4. PRICING
Prices listed must be in Nepalese Rupees (NPR). You may update pricing at any time. KothaFind does not charge commission on rentals.

5. PHOTOS & MEDIA
By uploading photos and videos, you confirm you own the rights to that content and grant KothaFind a non-exclusive licence to display it on the platform.

6. REMOVAL OF LISTINGS
KothaFind may remove listings that violate these terms without prior notice. Repeat violations may result in account suspension.

7. VERIFICATION
Renter accounts may be required to submit citizenship or property documents for verification. Unverified accounts may have limited visibility.

8. DISPUTES
Any disputes between renters and tenants are to be resolved between the parties. KothaFind is not liable for any losses arising from rental agreements made through the platform.

9. CHANGES TO TERMS
KothaFind reserves the right to update these terms. Continued use of the platform constitutes acceptance of the updated terms.`;

function StepTerms({onFinish}) {
  const [agreed,  setAgreed]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const handleFinish=async()=>{
    if(!agreed){setErr("You must agree to the terms to continue.");return;}
    setErr(""); setLoading(true);
    try {
      await apiPost("/renter/accept-terms/",{agreed:true});
      onFinish();
    } catch(e){ setErr("Failed to submit. Please try again."); }
    finally{ setLoading(false); }
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:C.txt,marginBottom:4}}>
        Terms & Conditions
      </h2>
      <p style={{fontSize:13,color:C.txt2,marginBottom:20}}>
        Please read and agree to KothaFind's renter terms before publishing.
      </p>

      <div style={{background:C.card,border:`0.5px solid ${C.bdr2}`,borderRadius:12,
        padding:"16px",height:300,overflowY:"auto",marginBottom:16,
        fontSize:13,color:C.txt2,lineHeight:1.8,whiteSpace:"pre-line"}}>
        {TERMS_TEXT}
      </div>

      <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:20}}>
        <div onClick={()=>setAgreed(a=>!a)}
          style={{width:18,height:18,borderRadius:5,marginTop:1,flexShrink:0,
            border:`0.5px solid ${agreed?C.teal:C.bdr2}`,
            background:agreed?C.teal:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {agreed&&<span style={{color:"#001a1a",fontSize:12,fontWeight:700}}>✓</span>}
        </div>
        <span style={{fontSize:13,color:C.txt2,lineHeight:1.5}}>
          I have read and agree to KothaFind's Terms & Conditions. I confirm that all information I have provided is accurate and I take full responsibility for my listings.
        </span>
      </label>

      <ErrorBanner msg={err}/>
      <PrimaryBtn onClick={handleFinish} loading={loading} disabled={!agreed}>
        Agree & publish my listing →
      </PrimaryBtn>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Done screen
// ─────────────────────────────────────────────────────────────────────────────
function DoneScreen({onGoToDashboard}) {
  return (
    <div style={{textAlign:"center",padding:"40px 24px"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:C.tealDim,
        display:"flex",alignItems:"center",justifyContent:"center",
        margin:"0 auto 16px",fontSize:28,color:C.teal}}>
        🎉
      </div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:700,color:C.txt,marginBottom:8}}>
        Your listing is live!
      </h2>
      <p style={{fontSize:13,color:C.txt2,lineHeight:1.6,marginBottom:28,maxWidth:360,margin:"0 auto 28px"}}>
        Your room(s) are now visible to tenants across Kathmandu Valley. You can manage them from your dashboard.
      </p>
      <button type="button" onClick={onGoToDashboard}
        style={{padding:"12px 32px",borderRadius:10,border:"none",background:C.teal,
          color:"#001a1a",fontSize:14,fontWeight:600,fontFamily:"'Sora',sans-serif",cursor:"pointer"}}>
        Go to dashboard →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — RenterOnboarding
// ─────────────────────────────────────────────────────────────────────────────
export default function RenterOnboarding({onComplete}) {
  const [step,  setStep]  = useState(0);
  const [data,  setData]  = useState({});

  const next = (stepData={}) => {
    setData(d=>({...d,...stepData}));
    setStep(s=>s+1);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Inter,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>

      {/* Nav */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 24px",borderBottom:`0.5px solid ${C.bdr}`,background:C.surf,
        position:"sticky",top:0,zIndex:10}}>
        <Logo/>
        {step<5&&<span style={{fontSize:12,color:C.txt3}}>{step+1} of 5</span>}
      </nav>

      {/* Step bar */}
      {step<5&&<StepBar current={step}/>}

      {/* Content */}
      <div style={{maxWidth:640,margin:"0 auto",padding:"28px 24px 60px"}}>
        {step===0&&<StepLocation onNext={next}/>}
        {step===1&&<StepContact  onNext={next}/>}
        {step===2&&<StepProperty onNext={next}/>}
        {step===3&&<StepAddRoom  propertyId={data.propertyId} onNext={next}/>}
        {step===4&&<StepTerms    onFinish={()=>setStep(5)}/>}
        {step===5&&<DoneScreen   onGoToDashboard={onComplete}/>}
      </div>
    </div>
  );
}
