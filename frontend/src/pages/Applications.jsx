import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function Applications() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/applications/mine").then(r => setItems(r.data)); }, []);
  return <main className="page"><span className="eyebrow">Applicant</span><h1>My applications</h1>
    <div className="application-list">{items.map(a => <div className="application" key={a._id}><div><h3>{a.job?.title}</h3><p>{a.job?.company} · {a.job?.location}</p></div><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></div>)}</div>
    {!items.length && <div className="empty">You have not applied to any SmartJob-hosted jobs yet.</div>}
  </main>;
}
