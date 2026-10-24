import { useEffect, useState } from 'react';
import { Ban, Check, Search, UserRound } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
type Candidate = { _id: string; name: string; email: string; headline?: string; skills?: string[]; isActive?: boolean; lastSeenAt?: string; createdAt: string };

export function CandidateManagement({ token }: { token: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { void fetch(`${API}/api/recruiter/users`, { headers: { Authorization: `Bearer ${token}` } }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message ?? 'Could not load candidates.'); setCandidates(data); }).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Could not load candidates.')); }, [token]);
  const filtered = candidates.filter((candidate) => `${candidate.name} ${candidate.email} ${candidate.skills?.join(' ') ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  async function toggle(candidate: Candidate) {
    setError('');
    try {
      const response = await fetch(`${API}/api/recruiter/users/${candidate._id}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ active: candidate.isActive === false }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message ?? 'Could not update candidate.');
      setCandidates((items) => items.map((item) => item._id === candidate._id ? { ...item, isActive: data.isActive } : item));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update candidate.'); }
  }
  return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">TALENT POOL</div><h2>Manage candidates</h2><p>Candidates who applied to your published roles.</p></div><label className="search-box"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates" /></label></div>{error && <div className="form-error">{error}</div>}{!filtered.length ? <div className="empty-state"><div className="empty-art"><UserRound size={23} /></div><h3>{query ? 'No matches' : 'No candidates yet'}</h3><p>{query ? 'Try another name, email or skill.' : 'Applicants to your jobs will appear here.'}</p></div> : <div className="application-list">{filtered.map((candidate) => <article className="application-card candidate-admin-row" key={candidate._id}><div className="candidate-summary"><div className="avatar avatar-purple">{candidate.name.slice(0, 1).toUpperCase()}</div><div><strong>{candidate.name}</strong><span>{candidate.headline || candidate.email}</span><div className="job-tags">{candidate.skills?.slice(0, 8).map((skill) => <span key={skill}>{skill}</span>)}</div><small>{candidate.lastSeenAt ? `Last seen ${new Date(candidate.lastSeenAt).toLocaleString()}` : 'Online now'} · Joined {new Date(candidate.createdAt).toLocaleDateString()}</small></div><span className={`status-pill ${candidate.isActive === false ? 'status-cancelled' : 'status-completed'}`}>{candidate.isActive === false ? 'Disabled' : 'Active'}</span><button className="icon-button" title={candidate.isActive === false ? 'Restore access' : 'Disable account'} aria-label={candidate.isActive === false ? 'Restore access' : 'Disable account'} onClick={() => void toggle(candidate)}>{candidate.isActive === false ? <Check size={17} /> : <Ban size={17} />}</button></div></article>)}</div>}</section>;
}
