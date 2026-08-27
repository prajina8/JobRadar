import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Admin() {
  const [stats,setStats]=useState(null);
  useEffect(()=>{api.get("/admin/stats").then(r=>setStats(r.data));},[]);
  if(!stats)return <main className="page">Loading...</main>;
  return <main className="page"><span className="eyebrow">Administration</span><h1>Platform overview</h1><div className="stats">{Object.entries(stats).map(([k,v])=><div className="stat" key={k}><span>{k}</span><b>{v}</b></div>)}</div><div className="detail-card mt"><h2>Operations</h2><p>Manage source adapters, reported jobs, users and platform settings from the admin layer.</p></div></main>;
}
