import { useState } from 'react';
import { BookOpen, ChevronUp, Lightbulb, RotateCcw } from 'lucide-react';

type PracticeQuestion = { question: string; looksFor: string };
type RolePractice = { questions: PracticeQuestion[]; challenge: { title: string; prompt: string; consider: string } };

const commonQuestions: PracticeQuestion[] = [
  { question: 'Tell me about yourself and your experience.', looksFor: 'A concise story connecting your experience, strengths, and interest in this role.' },
  { question: 'Why are you interested in this role and our company?', looksFor: 'Specific reasons that show you understand the role and the company.' },
  { question: 'What is one strength you would bring to this team?', looksFor: 'A relevant strength backed by a brief, real example.' },
  { question: 'What is a skill you are currently working to improve?', looksFor: 'Honest self-awareness and concrete steps you are taking to improve.' },
  { question: 'Tell me about a mistake or failure and what you learned from it.', looksFor: 'Ownership, reflection, and how you changed your approach afterward.' },
  { question: 'Describe a disagreement with a teammate. How did you handle it?', looksFor: 'Listening, respectful communication, and focus on the shared outcome.' },
  { question: 'What kind of team and work environment helps you do your best work?', looksFor: 'A thoughtful answer that is relevant to the job and shows how you collaborate.' },
  { question: 'What questions do you have for us?', looksFor: 'Curiosity about the team, expectations, success measures, and next steps.' },
];

const practiceByRole: Record<string, RolePractice> = {
  'Frontend Developer': {
    questions: [
      { question: 'How would you explain the difference between state and props in React?', looksFor: 'Clear understanding of data flow, component ownership, and when each is appropriate.' },
      { question: 'A page feels slow when a large list renders. How would you investigate and improve it?', looksFor: 'A measured approach: profile first, then consider pagination, virtualization, memoization, and simpler rendering.' },
      { question: 'How do you make an interactive form accessible?', looksFor: 'Labels, keyboard support, focus management, useful validation messages, and semantic HTML.' },
      { question: 'Tell me about a UI bug that was difficult to reproduce. How did you track it down?', looksFor: 'A structured debugging process, communication, and how you confirmed the fix.' },
      { question: 'What is the difference between controlled and uncontrolled inputs in React?', looksFor: 'Where input state lives, how each approach works, and when you might choose one.' },
      { question: 'Why are keys important when rendering a list in React?', looksFor: 'How stable keys help React match items during updates and why array indexes can cause bugs.' },
      { question: 'How does JavaScript handle asynchronous work? Explain promises or async/await.', looksFor: 'A correct explanation of asynchronous flow and how errors are handled.' },
      { question: 'How would you build a responsive page that works on mobile and desktop?', looksFor: 'A mobile-friendly layout, flexible sizing, breakpoints chosen for content, and testing.' },
      { question: 'How do you decide what should be a reusable component?', looksFor: 'A balance between reuse, clear responsibilities, and avoiding needless abstraction.' },
      { question: 'How would you test a form component?', looksFor: 'User-focused checks for input, validation, submission, errors, and keyboard interaction.' },
      { question: 'A user reports that a page looks different in another browser. How would you investigate?', looksFor: 'Reproducing the issue, checking browser support, isolating styles or APIs, and verifying a fix.' },
      { question: 'How do you handle loading, empty, and error states when fetching data?', looksFor: 'Clear feedback for each state, safe retries where appropriate, and accessible announcements.' },
    ],
    challenge: { title: 'Build a searchable list', prompt: 'Create a list of job titles with a search box. Search should ignore letter case, show a friendly empty state, and work with a keyboard.', consider: 'Think about component structure, input state, accessibility, and how you would test filtering.' },
  },
  'Backend Developer': {
    questions: [
      { question: 'How would you design an API endpoint for creating a user account?', looksFor: 'Input validation, clear responses, password security, duplicate handling, and sensible error cases.' },
      { question: 'What is a database index, and when might an index make performance worse?', looksFor: 'Understanding of query speed versus storage and write costs, with an example.' },
      { question: 'How would you prevent a user from making too many password reset requests?', looksFor: 'Rate limits, generic responses, expiring tokens, and monitoring for abuse.' },
      { question: 'Describe a production issue you investigated. How did you find the cause?', looksFor: 'Logs and metrics, a careful hypothesis, safe mitigation, and follow-up prevention.' },
      { question: 'What is the difference between authentication and authorization?', looksFor: 'Authentication confirms identity; authorization determines what that identity may access.' },
      { question: 'What does it mean for an API operation to be idempotent?', looksFor: 'Repeating the same request has the same intended effect, with a suitable example.' },
      { question: 'How would you add pagination to an API that returns many records?', looksFor: 'A predictable pagination approach, limits, ordering, and handling changing data.' },
      { question: 'When would you use a database transaction?', looksFor: 'Keeping related changes consistent and handling failure without partial updates.' },
      { question: 'How would you choose between SQL and a document database for a new feature?', looksFor: 'Data relationships, query patterns, consistency needs, and operational trade-offs.' },
      { question: 'What is caching, and how can stale cached data cause problems?', looksFor: 'Where caching helps, invalidation or expiry, and correctness trade-offs.' },
      { question: 'How do you safely manage database schema changes while an app is running?', looksFor: 'Backward-compatible migrations, staged rollout, backups, and rollback planning.' },
      { question: 'How would you protect a public API from abuse?', looksFor: 'Authentication where needed, rate limits, validation, monitoring, and safe error responses.' },
    ],
    challenge: { title: 'Design a booking endpoint', prompt: 'Design an endpoint that books an appointment only if the selected time is still available. Explain the request, response, and how you prevent two users booking the same slot.', consider: 'Consider validation, database transactions or atomic updates, conflicts, and useful status codes.' },
  },
  'Full-Stack Developer': {
    questions: [
      { question: 'Walk me through how data moves from a form in the browser to a database and back.', looksFor: 'A coherent explanation of UI state, HTTP, server validation, persistence, and response handling.' },
      { question: 'How do you decide what validation belongs in the frontend and what belongs on the server?', looksFor: 'Good user experience on the client and authoritative, secure validation on the server.' },
      { question: 'How would you investigate a page that shows stale data after an update?', looksFor: 'Checking request/response, caching, state updates, and server persistence.' },
      { question: 'Tell me about a feature you delivered across the frontend and backend.', looksFor: 'Ownership, trade-offs, collaboration, and how the outcome was measured.' },
      { question: 'What happens when a browser sends an HTTPS request to your application?', looksFor: 'A clear high-level path through the browser, network, server, application, and response.' },
      { question: 'When would you render a page on the server instead of only in the browser?', looksFor: 'Trade-offs around initial load, search visibility, personalization, and complexity.' },
      { question: 'Where would you store a session token, and what security trade-offs matter?', looksFor: 'Awareness of XSS, CSRF, cookie settings, and the app’s threat model.' },
      { question: 'How would you investigate an API that works locally but fails in production?', looksFor: 'Comparing configuration, logs, network behavior, dependencies, and deployment differences.' },
      { question: 'How do you decide which parts of a feature to test at each level?', looksFor: 'A practical mix of unit, integration, and end-to-end tests based on risk.' },
      { question: 'How would you make a long-running task feel responsive to users?', looksFor: 'Progress or status feedback, asynchronous processing, and safe retry behavior.' },
      { question: 'How do you manage configuration and secrets across development and production?', looksFor: 'Environment-based configuration, secret storage, access limits, and no secrets in source control.' },
      { question: 'A release causes errors for some users. What steps would you take?', looksFor: 'Assessing impact, using monitoring, communicating, mitigating or rolling back, and learning.' },
    ],
    challenge: { title: 'Build a simple task tracker', prompt: 'Sketch a small app where users can add tasks, mark them complete, and filter by status. Describe the API and data model you would use.', consider: 'Think about loading and error states, validation, data ownership, and how the UI stays in sync.' },
  },
  'Product Designer': {
    questions: [
      { question: 'How would you learn why new users abandon an onboarding flow?', looksFor: 'Combining user interviews or usability tests with product data, without jumping to a solution.' },
      { question: 'Tell me about a design decision you changed after getting feedback.', looksFor: 'Openness to evidence, clear reasoning, and the impact of the change.' },
      { question: 'How do you make sure a design works for people using assistive technology?', looksFor: 'Accessibility considered early, contrast, keyboard use, screen readers, and testing with users.' },
      { question: 'How do you work with engineers when a design is difficult to implement?', looksFor: 'Shared problem-solving, explaining user needs, and finding a practical compromise.' },
      { question: 'Walk me through a project in your portfolio. What was your contribution?', looksFor: 'The problem, your role, process, decisions, collaboration, and outcome.' },
      { question: 'How do you plan and run a usability test?', looksFor: 'Clear research questions, neutral tasks, representative participants, and useful synthesis.' },
      { question: 'How do you decide whether to use an existing design system component or create a new one?', looksFor: 'Consistency, user needs, accessibility, and the cost of maintaining a new pattern.' },
      { question: 'How do you balance user needs with business goals?', looksFor: 'Evidence and transparent trade-offs that seek a useful outcome for both.' },
      { question: 'How would you design an experience for a user with low vision?', looksFor: 'Contrast, scalable text, non-color cues, keyboard support, and testing with users.' },
      { question: 'What do you include when handing a design to engineering?', looksFor: 'States, spacing, responsive behavior, interaction details, assets, and open questions.' },
      { question: 'How do you know whether a design change improved the experience?', looksFor: 'A user-centered measure, baseline, qualitative feedback, and attention to unintended effects.' },
      { question: 'Tell me about a time a stakeholder disagreed with your design recommendation.', looksFor: 'Listening, explaining the evidence, exploring options, and agreeing on a way forward.' },
    ],
    challenge: { title: 'Improve appointment booking', prompt: 'Users often leave a booking flow before choosing a time. Describe how you would understand the problem and sketch a better flow.', consider: 'State your assumptions, identify user needs, consider edge cases, and define how you would measure improvement.' },
  },
  'Data Analyst': {
    questions: [
      { question: 'A dashboard shows that weekly active users dropped by 15%. How would you investigate?', looksFor: 'Checking data quality and definitions first, then segmenting the change and looking for causes.' },
      { question: 'Explain the difference between a mean and a median. When would you prefer each?', looksFor: 'A simple example showing how outliers affect the mean.' },
      { question: 'How would you explain an uncertain result to a non-technical stakeholder?', looksFor: 'Plain language, relevant context, limitations, and a useful next step.' },
      { question: 'Tell me about a time your analysis changed a decision.', looksFor: 'A clear question, trustworthy method, communication, and measurable impact.' },
      { question: 'What is the difference between an INNER JOIN and a LEFT JOIN?', looksFor: 'Which records each join preserves, explained with a simple table example.' },
      { question: 'How would you find duplicate records in a dataset using SQL?', looksFor: 'Grouping by the relevant fields, counting rows, and confirming what counts as a duplicate.' },
      { question: 'How do NULL values affect calculations and filters in SQL?', looksFor: 'NULL is not the same as zero, and needs explicit handling in comparisons and aggregates.' },
      { question: 'How would you evaluate the result of an A/B test?', looksFor: 'A clear hypothesis and metric, adequate sample, uncertainty, and guardrail checks.' },
      { question: 'What is the difference between correlation and causation?', looksFor: 'A clear explanation that association alone does not prove one factor caused another.' },
      { question: 'How do you clean a dataset before analyzing it?', looksFor: 'Checking types, missing values, duplicates, outliers, and documenting assumptions.' },
      { question: 'How would you choose the right chart for a business report?', looksFor: 'Matching the chart to the question, readable labels, and avoiding misleading scales.' },
      { question: 'A stakeholder asks for a metric but the definition is unclear. What do you do?', looksFor: 'Clarifying the decision, agreeing on a definition, and documenting the calculation.' },
    ],
    challenge: { title: 'Investigate a conversion drop', prompt: 'An online store’s checkout conversion fell from 40% to 32% this week. Explain what data you would check and how you would narrow down the cause.', consider: 'Check tracking and date ranges, segment by device and step, compare against earlier periods, and avoid claiming causation too soon.' },
  },
  'Product Manager': {
    questions: [
      { question: 'How would you decide which of several customer problems to solve first?', looksFor: 'A transparent framework using user impact, strategy, effort, evidence, and trade-offs.' },
      { question: 'An important launch is delayed. How would you communicate and respond?', looksFor: 'Early, direct communication; options; ownership; and keeping teams aligned.' },
      { question: 'How would you measure whether a new feature is successful?', looksFor: 'A clear user outcome, leading and guardrail metrics, and a plan to learn after launch.' },
      { question: 'Tell me about a time you had to say no to a feature request.', looksFor: 'Empathy, evidence, explaining the decision, and offering alternatives when possible.' },
      { question: 'How do you discover and validate a customer problem before proposing a solution?', looksFor: 'Talking to users, reviewing evidence, testing assumptions, and defining the problem clearly.' },
      { question: 'How do you turn a product goal into a roadmap?', looksFor: 'Outcomes and themes, sequencing, dependencies, and room to adapt as evidence changes.' },
      { question: 'What metrics would you track after launching a new feature?', looksFor: 'An outcome metric, adoption or engagement signals, and guardrails for user harm.' },
      { question: 'How do you prioritize when sales, support, and engineering all have urgent requests?', looksFor: 'A consistent framework, impact and urgency, transparent decisions, and communication.' },
      { question: 'How would you handle a feature launch that is meeting its target but hurting another metric?', looksFor: 'Looking at the whole user and business impact, investigating trade-offs, and adjusting.' },
      { question: 'What makes a good user story and acceptance criteria?', looksFor: 'A user need and outcome, clear boundaries, and testable conditions.' },
      { question: 'How do you keep stakeholders aligned when priorities change?', looksFor: 'Early communication, rationale, updated plans, and clear ownership of decisions.' },
      { question: 'Tell me about a product decision that did not work. What did you do next?', looksFor: 'Accountability, learning from evidence, and a timely adjustment.' },
    ],
    challenge: { title: 'Prioritize a small roadmap', prompt: 'Your team can build one of three things this month: faster search, saved favorites, or a redesigned profile. Explain what information you need and how you would choose.', consider: 'Connect the choice to user problems and company goals; make assumptions and trade-offs explicit.' },
  },
};

export function MockPractice() {
  const roles = Object.keys(practiceByRole);
  const [role, setRole] = useState(roles[0]!);
  const [openHints, setOpenHints] = useState<string[]>([]);
  const practice = practiceByRole[role]!;

  function changeRole(nextRole: string) {
    setRole(nextRole);
    setOpenHints([]);
  }

  function toggleHint(id: string) {
    setOpenHints((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function renderQuestions(questions: PracticeQuestion[], group: string) {
    return <div className="practice-question-list">{questions.map((item, index) => {
      const id = `${group}-${index}`;
      const hintIsOpen = openHints.includes(id);
      return <article className="practice-question" key={`${group}-${item.question}`}><div className="practice-question-number">{String(index + 1).padStart(2, '0')}</div><div className="practice-question-content"><h3>{item.question}</h3><button className="practice-hint-toggle" onClick={() => toggleHint(id)} aria-expanded={hintIsOpen}>{hintIsOpen ? <ChevronUp size={15} /> : <Lightbulb size={15} />}{hintIsOpen ? 'Hide what to cover' : 'What the interviewer is looking for'}</button>{hintIsOpen && <p className="practice-hint">{item.looksFor}</p>}</div></article>;
    })}</div>;
  }

  return <section className="practice-page">
    <div className="practice-intro">
      <div className="practice-intro-icon"><BookOpen size={21} /></div>
      <div><div className="eyebrow">PRACTICE AT YOUR PACE</div><h2>Choose a role to get started</h2><p>Pick the job you’re preparing for. Your questions and practice challenge will update to match.</p></div>
      <label className="practice-role-picker"><span>Target role</span><select value={role} onChange={(event) => changeRole(event.target.value)}>{roles.map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
    <div className="practice-section-heading"><div><div className="eyebrow">COMMON TO MOST ROLES</div><h2>Questions companies often ask</h2></div><span className="practice-count">{commonQuestions.length} questions</span></div>
    {renderQuestions(commonQuestions, 'common')}
    <div className="practice-section-heading"><div><div className="eyebrow">{role.toUpperCase()}</div><h2>Role-specific questions</h2></div><span className="practice-count">{practice.questions.length} questions</span></div>
    {renderQuestions(practice.questions, role)}
    <article className="practice-challenge"><div className="practice-challenge-heading"><div><div className="eyebrow">HANDS-ON PRACTICE</div><h2>{practice.challenge.title}</h2></div><span className="practice-challenge-tag">{role}</span></div><p>{practice.challenge.prompt}</p><details><summary><Lightbulb size={15} /> A few things to consider</summary><p>{practice.challenge.consider}</p></details></article>
    <button className="practice-reset" onClick={() => { setOpenHints([]); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><RotateCcw size={14} /> Reset practice view</button>
  </section>;
}
