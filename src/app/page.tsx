
"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

// --- Interfaces ---
interface ScraperResult {
  [key: string]: any;
}

export default function Home() {
  // --- Config State ---
  // --- Config State ---
  // Tokens are now handled server-side via .env.local
  // const [chatModel, setChatModel] = useState('deepseek-ai/DeepSeek-V3.2:novita'); // Optional: could keep for UI toggle if needed

  // --- App State ---
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scraperResult, setScraperResult] = useState<ScraperResult | null>(null);
  const [jobResults, setJobResults] = useState<any[]>([]); // New state for jobs
  const [scraperError, setScraperError] = useState<string | null>(null);
  const [aiResume, setAiResume] = useState<string>('');
  const [activeResultTab, setActiveResultTab] = useState<'resume' | 'jobs'>('resume');
  const [steps, setSteps] = useState<string>('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScraperResult(null);
    setJobResults([]);
    setScraperError(null);
    setAiResume('');
    setSteps('🚀 Starting process...');

    try {
      // 1. Scrape Profile
      setSteps('🔍 Scraping LinkedIn Profile...');
      const res = await fetch('/api/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkedinUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scrape profile');
      setScraperResult(data.profile);

      const location = data.profile.location?.countryName || 'Indonesia';

      // 2. Analysis & AI Resume (Sequential Flow)
      setSteps('✨ Analyzing Profile & Generating Resume...');
      const prompt = `
Please analyze this LinkedIn Profile JSON to do two things:
1. Determine the single BEST job title to search for matching jobs for this candidate.
2. Generate a comprehensive, professional Resume in BAHASA INDONESIA.

**Output Format:**
JOB_SEARCH_QUERY: {Insert Job Title Here}
RESUME_START
{Insert Resume Markdown Here}

**Resume Requirements:**
- Bahasa Indonesia.
- Professional tone.
- Detailed experience, skills, and summary.
- Clean Markdown.

JSON Data:
${JSON.stringify(data.profile)}
      `;

      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.error);

      // Parse AI Response
      const content = chatData.content;
      let aiResumeText = content;
      let jobQuery = '';

      if (content.includes('JOB_SEARCH_QUERY:')) {
        const parts = content.split('RESUME_START');
        const metaPart = parts[0];
        aiResumeText = parts[1] || parts[0]; // Fallback if tag missing

        const match = metaPart.match(/JOB_SEARCH_QUERY:\s*(.+)/);
        if (match) {
          jobQuery = match[1].trim();
        }
      }

      setAiResume(aiResumeText.trim());

      // 3. Search Jobs (Using AI-derived title)
      if (jobQuery) {
        setSteps(`💼 Finding Jobs for "${jobQuery}"...`);
        console.log('🤖 AI Recommends Searching for:', jobQuery);

        const jobRes = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: jobQuery,
            location: location
          }),
        });

        const jobData = await jobRes.json();
        if (jobData.jobs) setJobResults(jobData.jobs);

      } else {
        console.warn("⚠️ AI did not return a job query.");
      }

      setSteps('✅ Done!');



    } catch (err: any) {
      setScraperError(err.message);
      setSteps('❌ Failed.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4 md:p-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border border-gray-100">

        {/* Header */}
        <div className="bg-white p-8 border-b border-gray-100 text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            LinkedIn Profile Analyzer & Job Matcher
          </h1>
          <p className="text-gray-500">Automated Scraper, AI Resume & Job Recommendations</p>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">

          {/* Input Form */}
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">LinkedIn URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username/"
                  className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-transform transform hover:scale-105 ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-blue-200'
                    }`}
                >
                  {loading ? 'Processing...' : 'Analyze Profile'}
                </button>
              </div>
            </div>


          </form>

          {/* Status Steps */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-progress w-full origin-left"></div>
                </div>
                <span className="text-gray-500 font-medium">{steps}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {scraperError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm text-center">
              <strong>Error:</strong> {scraperError}
            </div>
          )}

          {/* Results Area */}
          {(aiResume || jobResults.length > 0) && !loading && (
            <div className="pt-8 border-t border-gray-100">
              {/* Result Tabs */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                  <button
                    onClick={() => setActiveResultTab('resume')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeResultTab === 'resume' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    📄 AI Resume
                  </button>
                  <button
                    onClick={() => setActiveResultTab('jobs')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeResultTab === 'jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    💼 Job Recommendations
                    {jobResults.length > 0 && <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{jobResults.length}</span>}
                  </button>
                </div>
              </div>

              {/* View: AI Resume */}
              {activeResultTab === 'resume' && aiResume && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-purple-50 prose prose-sm max-w-none prose-headings:text-purple-700 prose-a:text-blue-600 prose-strong:text-gray-800 mx-auto">
                  <ReactMarkdown>{aiResume}</ReactMarkdown>
                </div>
              )}

              {/* View: Job Recommendations */}
              {activeResultTab === 'jobs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobResults.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-400 py-10 italic">No jobs found yet.</div>
                  ) : (
                    jobResults.map((job: any, index: number) => (
                      <a href={job.url} target="_blank" key={index} className="block group">
                        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 h-full flex flex-col">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-blue-600 text-lg group-hover:underline line-clamp-2 leading-tight">{job.title}</h4>
                              <span className="text-sm font-semibold text-gray-700 block mt-1">{job.organization || 'Unknown Company'}</span>
                            </div>
                            {job.organization_logo && (
                              <img src={job.organization_logo} alt="Logo" className="w-10 h-10 rounded-md object-contain border border-gray-100 bg-white" />
                            )}
                          </div>

                          <div className="mt-auto space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>📍 {job.locations_derived?.[0] || 'Remote/Unknown'}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono pt-2 border-t border-gray-50 flex justify-between">
                              <span>Posted: {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : 'Recently'}</span>
                              {job.salary_raw?.value && (
                                <span className="text-green-600 font-bold">
                                  {job.salary_raw.currency} {job.salary_raw.value.minValue ? `${job.salary_raw.value.minValue / 1000}k` : ''} - {job.salary_raw.value.maxValue ? `${job.salary_raw.value.maxValue / 1000}k` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
