import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Briefcase, 
  Layers, 
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';

const Admin = () => {
  const [adminSecret, setAdminSecret] = useState(
    localStorage.getItem('resjo_admin_secret') || ''
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Ingest state
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  
  // Search test state
  const [keywords, setKeywords] = useState('software developer');
  const [location, setLocation] = useState('Remote');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  // Feedback notification
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getAdminBaseURL = () => {
    let url = import.meta.env.VITE_API_URL;
    if (url) {
      url = url.trim().replace(/\/api\/?$/, '');
      return url;
    }
    return 'http://localhost:5050';
  };

  const API_BASE = getAdminBaseURL();

  const handleLogin = (e) => {
    e?.preventDefault();
    if (!adminSecret.trim()) {
      setErrorMsg('Please enter the Admin Secret key');
      return;
    }
    localStorage.setItem('resjo_admin_secret', adminSecret);
    setIsAuthenticated(true);
    fetchStats(adminSecret);
  };

  const handleLogout = () => {
    localStorage.removeItem('resjo_admin_secret');
    setAdminSecret('');
    setIsAuthenticated(false);
    setStats(null);
  };

  const fetchStats = async (secretKey = adminSecret) => {
    setLoadingStats(true);
    setErrorMsg('');
    try {
      const res = await axios.get(`${API_BASE}/admin/stats`, {
        headers: { 'x-admin-secret': secretKey }
      });
      setStats(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid admin secret or server unreachable');
      if (err.response?.status === 403) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const handleTriggerIngest = async () => {
    setIngesting(true);
    setIngestResult(null);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/ingest-jobs`,
        {},
        { headers: { 'x-admin-secret': adminSecret } }
      );
      setIngestResult(res.data.result);
      setSuccessMsg('JSearch ingestion completed successfully!');
      fetchStats();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Ingestion failed');
    } finally {
      setIngesting(false);
    }
  };

  const handleTestSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setSearchResults(null);
    setErrorMsg('');
    try {
      const res = await axios.post(
        `${API_BASE}/admin/search-jobs`,
        { keywords, location },
        { headers: { 'x-admin-secret': adminSecret } }
      );
      setSearchResults(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Search test failed');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (adminSecret) {
      fetchStats(adminSecret);
    }
  }, []);

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Admin Control Center</h2>
          <p className="text-sm text-text-secondary text-center mb-6">
            Enter your secure Admin Secret to manage job ingestion & live pipelines.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                Admin Secret Key
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Enter ADMIN_SECRET..."
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary transition"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loadingStats}
              className="w-full py-3 bg-primary text-surface font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {loadingStats ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              Access Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD SCREEN ────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Job Pipeline Control</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              72h Cron Active
            </span>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            Automated JSearch RapidAPI Ingestion & Live MongoDB Health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats()}
            disabled={loadingStats}
            className="px-4 py-2 bg-surface border border-border hover:bg-border/40 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <RefreshCw size={16} className={loadingStats ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium transition"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-surface border border-border rounded-2xl">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-sm font-medium">Total Jobs in DB</span>
            <Database size={18} className="text-primary" />
          </div>
          <div className="text-3xl font-bold">{stats?.totalJobs ?? '...'}</div>
          <div className="text-xs text-text-secondary mt-1">
            {stats?.jsearchJobs ?? 0} from JSearch RapidAPI
          </div>
        </div>

        <div className="p-5 bg-surface border border-border rounded-2xl">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-sm font-medium">Internships</span>
            <Briefcase size={18} className="text-indigo-400" />
          </div>
          <div className="text-3xl font-bold">{stats?.breakdown?.intern ?? '...'}</div>
          <div className="text-xs text-text-secondary mt-1">Matched for students</div>
        </div>

        <div className="p-5 bg-surface border border-border rounded-2xl">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-sm font-medium">Fresher / Entry Level</span>
            <Layers size={18} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-bold">{stats?.breakdown?.fresher ?? '...'}</div>
          <div className="text-xs text-text-secondary mt-1">Matched for fresh grads</div>
        </div>

        <div className="p-5 bg-surface border border-border rounded-2xl">
          <div className="flex items-center justify-between text-text-secondary mb-2">
            <span className="text-sm font-medium">Professional</span>
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold">{stats?.breakdown?.professional ?? '...'}</div>
          <div className="text-xs text-text-secondary mt-1">Mid/Senior level roles</div>
        </div>
      </div>

      {/* Manual Trigger Section */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <RefreshCw className="text-primary" size={20} />
              Manual JSearch Ingestion Trigger
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Fetch real-time 72h tech jobs across Software, Frontend, Backend, & Mobile roles and insert new records into MongoDB immediately.
            </p>
          </div>
          <button
            onClick={handleTriggerIngest}
            disabled={ingesting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-w-[200px]"
          >
            {ingesting ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                Ingesting from RapidAPI...
              </>
            ) : (
              <>
                <Database size={18} />
                Run Ingest Now
              </>
            )}
          </button>
        </div>

        {/* Ingest Result Card */}
        {ingestResult && (
          <div className="mt-6 p-4 bg-background border border-border rounded-xl grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-xs text-text-secondary uppercase">New Jobs Inserted</span>
              <p className="text-2xl font-bold text-emerald-400">+{ingestResult.inserted}</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary uppercase">Duplicates Skipped</span>
              <p className="text-2xl font-bold text-yellow-400">{ingestResult.skipped}</p>
            </div>
            <div>
              <span className="text-xs text-text-secondary uppercase">Errors</span>
              <p className="text-2xl font-bold text-red-400">{ingestResult.errors}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live API Search Tester */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Search className="text-primary" size={20} />
          Test JSearch Query (Live Preview)
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Test any role or keyword directly against the RapidAPI JSearch engine without saving to DB.
        </p>

        <form onSubmit={handleTestSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. React Developer, Python..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Remote, India, US..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={searching}
              className="w-full py-2.5 bg-foreground text-surface font-semibold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 text-sm shadow cursor-pointer"
            >
              {searching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              Search JSearch API
            </button>
          </div>
        </form>

        {/* Live Search Results */}
        {searchResults && (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-semibold text-text-secondary flex items-center justify-between">
              <span>Found {searchResults.count} Jobs:</span>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {searchResults.jobs?.map((job, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-background border border-border rounded-xl flex items-center justify-between gap-4 text-sm"
                >
                  <div className="truncate">
                    <span className="font-semibold">{job.title}</span>
                    <span className="text-text-secondary ml-2">@{job.company}</span>
                    <span className="text-xs text-primary ml-2">({job.location})</span>
                  </div>
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-xs shrink-0"
                    >
                      Apply Link <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent MongoDB Jobs Table */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Clock className="text-primary" size={20} />
          Latest 8 Jobs in MongoDB
        </h2>

        {stats?.latestJobs && stats.latestJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-text-secondary">
                <tr>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Company</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Experience</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Inserted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.latestJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-border/20 transition">
                    <td className="py-3 px-3 font-medium truncate max-w-[220px]">
                      {job.title}
                    </td>
                    <td className="py-3 px-3 text-text-secondary truncate max-w-[160px]">
                      {job.company}
                    </td>
                    <td className="py-3 px-3 text-text-secondary">{job.location || 'Remote'}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        job.experienceLevel === 'intern'
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : job.experienceLevel === 'fresher'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {job.experienceLevel || 'general'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs uppercase font-semibold text-primary">
                      {job.source}
                    </td>
                    <td className="py-3 px-3 text-xs text-text-secondary">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No jobs loaded yet in database.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
