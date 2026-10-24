import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Building2, Check, Clock3, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
type ReviewStatus = 'pending' | 'approved' | 'rejected';
type CompanySubmission = { _id: string; name: string; domain: string; website: string; description: string; status: 'pending' | 'verified' | 'rejected'; reviewNote?: string; submittedBy?: { name: string; email: string } };
type JobSubmission = { _id: string; title: string; company: string; location: string; salary: string; experience: string; skills: string[]; description: string; deadline?: string; reviewStatus: ReviewStatus; reviewNote?: string; companyId?: CompanySubmission; createdBy?: { name: string; email: string } };

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? 'Request failed.');
  return body as T;
}

export function CompanySubmissionPortal({ token }: { token: string }) {
  const [company, setCompany] = useState<CompanySubmission | null>(null);
  const [jobs, setJobs] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [submission, ownJobs] = await Promise.all([
        request<CompanySubmission | null>('/api/company/submission', token),
        request<JobSubmission[]>('/api/jobs', token),
      ]);
      setCompany(submission); setJobs(ownJobs);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load company submissions.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [token]);

  async function submitCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await request<CompanySubmission>('/api/company/submission', token, { method: 'POST', body: JSON.stringify({ name: form.get('name'), domain: form.get('domain'), website: form.get('website'), description: form.get('description') }) });
      setCompany(result); setShowCompanyForm(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not submit company details.'); }
    finally { setBusy(false); }
  }

  async function submitJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      await request<JobSubmission>('/api/company/jobs', token, { method: 'POST', body: JSON.stringify({ title: form.get('title'), location: form.get('location'), salary: form.get('salary'), experience: form.get('experience'), skills: String(form.get('skills')).split(',').map((skill) => skill.trim()).filter(Boolean), description: form.get('description'), ...(form.get('deadline') ? { deadline: new Date(String(form.get('deadline'))).toISOString() } : {}) }) });
      setShowJobForm(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not submit vacancy.'); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="loading-screen">Loading company submissions…</div>;
  return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">EMPLOYER WORKSPACE</div><h2>Company & vacancies</h2><p>Submit your company details for recruiter review, then send vacancies for approval.</p></div></div>{error && <div className="form-error">{error}</div>}
    {!company || company.status === 'rejected' ? <div className="review-card"><div className="review-card-title"><Building2 size={18} /><div><strong>{company ? 'Company verification needs attention' : 'Submit company for verification'}</strong><p>{company?.reviewNote || 'Provide your company domain and website. A recruiter will review the details before you publish vacancies.'}</p></div></div><button className="button button-primary" onClick={() => setShowCompanyForm(true)}>{company ? 'Update company details' : 'Submit company details'}<ArrowRight size={15} /></button></div> : <div className="review-card"><div className="review-card-title"><Building2 size={18} /><div><strong>{company.name}</strong><p>{company.domain} · {company.website}</p></div></div><span className={`status-pill ${company.status === 'verified' ? 'status-completed' : 'status-scheduled'}`}>{company.status === 'verified' ? <><BadgeCheck size={12} /> Verified</> : <><Clock3 size={12} /> Verification pending</>}</span>{company.status === 'pending' && <p className="job-company">You can submit vacancies now; they won’t appear to candidates until the company and job are approved.</p>}</div>}
    <div className="section-heading company-job-heading"><div><div className="eyebrow">VACANCIES</div><h2>Your submissions <span className="heading-count">{jobs.length}</span></h2></div><button className="button button-primary" onClick={() => setShowJobForm(true)} disabled={!company || company.status === 'rejected'}><BriefcaseBusiness size={15} /> Submit vacancy</button></div>
    {!jobs.length ? <div className="empty-state"><div className="empty-art"><BriefcaseBusiness size={23} /></div><h3>No vacancies submitted</h3><p>Your recruiter will review the company and job details before the job is published.</p></div> : <div className="job-grid">{jobs.map((job) => <article className="job-card" key={job._id}><div className="job-card-top"><div className="job-company-mark">{job.company.slice(0, 1).toUpperCase()}</div><span className={`status-pill ${job.reviewStatus === 'approved' ? 'status-completed' : job.reviewStatus === 'rejected' ? 'status-cancelled' : 'status-scheduled'}`}>{job.reviewStatus ?? 'pending review'}</span></div><h3>{job.title}</h3><p className="job-company">{job.company} · {job.location}</p><p className="job-description">{job.description}</p>{job.reviewNote && <p className="review-note">Recruiter note: {job.reviewNote}</p>}</article>)}</div>}
    {showCompanyForm && <div className="modal-backdrop"><div className="modal-card"><div className="modal-top"><div className="modal-icon"><Building2 size={20} /></div><button className="icon-button" onClick={() => setShowCompanyForm(false)} aria-label="Close"><X size={18} /></button></div><div className="eyebrow">COMPANY VERIFICATION</div><h2>Submit company details</h2><p>Use a company email address that matches the domain. Recruiters review the evidence manually.</p><form onSubmit={submitCompany}><label className="field-label">Legal or trading name<input name="name" required maxLength={160} defaultValue={company?.name} /></label><label className="field-label">Company email domain<input name="domain" required placeholder="example.com" defaultValue={company?.domain} /></label><label className="field-label">Company website<input name="website" required type="url" placeholder="https://example.com" defaultValue={company?.website} /></label><label className="field-label">Company details<textarea name="description" rows={3} maxLength={2000} defaultValue={company?.description} placeholder="Briefly describe the organization and how to verify it." /></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-light" onClick={() => setShowCompanyForm(false)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit for verification'}</button></div></form></div></div>}
    {showJobForm && <div className="modal-backdrop"><div className="modal-card"><div className="modal-top"><div className="modal-icon"><BriefcaseBusiness size={20} /></div><button className="icon-button" onClick={() => setShowJobForm(false)} aria-label="Close"><X size={18} /></button></div><div className="eyebrow">RECRUITER REVIEW REQUIRED</div><h2>Submit a vacancy</h2><p>This job stays hidden from candidates until the company is verified and a recruiter approves the posting.</p><form onSubmit={submitJob}><label className="field-label">Job title<input name="title" required maxLength={120} /></label><div className="form-two-cols"><label className="field-label">Location<input name="location" required /></label><label className="field-label">Salary range<input name="salary" /></label></div><div className="form-two-cols"><label className="field-label">Experience<input name="experience" /></label><label className="field-label">Deadline<input name="deadline" type="date" min={new Date().toISOString().slice(0, 10)} /></label></div><label className="field-label">Skills, comma-separated<input name="skills" placeholder="React, TypeScript" /></label><label className="field-label">Description<textarea name="description" required minLength={20} maxLength={8000} rows={4} /></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="button button-light" onClick={() => setShowJobForm(false)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Submitting…' : 'Send to recruiter'}</button></div></form></div></div>}
  </section>;
}

export function CompanyReviewQueue({ token }: { token: string }) {
  const [companies, setCompanies] = useState<CompanySubmission[]>([]);
  const [jobs, setJobs] = useState<JobSubmission[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const load = async () => {
    try {
      const [companyItems, jobItems] = await Promise.all([request<CompanySubmission[]>('/api/recruiter/company-submissions', token), request<JobSubmission[]>('/api/recruiter/job-submissions', token)]);
      setCompanies(companyItems); setJobs(jobItems);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load review queue.'); }
  };
  useEffect(() => { void load(); }, [token]);
  async function reviewCompany(id: string, status: 'verified' | 'rejected') {
    try { await request(`/api/recruiter/company-submissions/${id}`, token, { method: 'PATCH', body: JSON.stringify({ status, reviewNote: notes[id] ?? '' }) }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not review company.'); }
  }
  async function reviewJob(id: string, status: 'approved' | 'rejected') {
    try { await request(`/api/recruiter/job-submissions/${id}`, token, { method: 'PATCH', body: JSON.stringify({ status, reviewNote: notes[id] ?? '' }) }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not review vacancy.'); }
  }
  return <section className="feature-page"><div className="feature-heading"><div><div className="eyebrow">RECRUITER WORKFLOW</div><h2>Company & vacancy review</h2><p>Verify the organization first, then approve its pending vacancies.</p></div><button className="button button-light" onClick={() => void load()}>Refresh queue</button></div>{error && <div className="form-error">{error}</div>}<div className="section-heading"><div><div className="eyebrow">STEP 1</div><h2>Company verification <span className="heading-count">{companies.length}</span></h2></div></div>{!companies.length ? <p className="review-empty">No company profiles are waiting for verification.</p> : <div className="application-list">{companies.map((company) => <article className="application-card" key={company._id}><div className="company-review-header"><div><h3>{company.name}</h3><p>{company.submittedBy?.name} · {company.submittedBy?.email}</p><p>Domain: {company.domain} · Website: <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a></p><p>{company.description}</p></div><span className="status-pill status-scheduled">Pending</span></div><label className="field-label">Review notes<textarea rows={2} maxLength={1000} value={notes[company._id] ?? ''} onChange={(event) => setNotes((items) => ({ ...items, [company._id]: event.target.value }))} placeholder="Record what you checked; give a reason if rejecting." /></label><div className="review-actions"><button className="button button-light" onClick={() => void reviewCompany(company._id, 'rejected')}><X size={14} /> Reject company</button><button className="button button-primary" onClick={() => void reviewCompany(company._id, 'verified')}><Check size={14} /> Verify company</button></div></article>)}</div>}<div className="section-heading company-review-jobs-heading"><div><div className="eyebrow">STEP 2</div><h2>Pending vacancies <span className="heading-count">{jobs.length}</span></h2></div></div>{!jobs.length ? <p className="review-empty">No job postings are waiting for approval.</p> : <div className="application-list">{jobs.map((job) => <article className="application-card" key={job._id}><div className="company-review-header"><div><h3>{job.title} · {job.company}</h3><p>{job.location} · {job.salary || 'Salary not listed'} · submitted by {job.createdBy?.email}</p><p>{job.description}</p><div className="job-tags">{job.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><span className={`status-pill ${job.companyId?.status === 'verified' ? 'status-completed' : 'status-scheduled'}`}>Company {job.companyId?.status ?? 'unverified'}</span></div><label className="field-label">Review notes<textarea rows={2} maxLength={1000} value={notes[job._id] ?? ''} onChange={(event) => setNotes((items) => ({ ...items, [job._id]: event.target.value }))} placeholder="Optional note to the company." /></label><div className="review-actions"><button className="button button-light" onClick={() => void reviewJob(job._id, 'rejected')}><X size={14} /> Reject vacancy</button><button className="button button-primary" disabled={job.companyId?.status !== 'verified'} title={job.companyId?.status !== 'verified' ? 'Verify the company first' : 'Approve and publish'} onClick={() => void reviewJob(job._id, 'approved')}><Check size={14} /> Approve & publish</button></div></article>)}</div>}</section>;
}
