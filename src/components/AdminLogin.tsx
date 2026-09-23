import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, Info, KeyRound, CheckCircle2, Server, Settings2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../utils/assets';
import { getActiveApiBaseUrl, getCustomApiUrl, setCustomApiUrl } from '../services/api';

interface AdminLoginProps {
  onSuccess?: () => void;
  onExit?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onExit }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Production Backend Server Status & Diagnostics
  const [activeBaseUrl, setActiveBaseUrl] = useState(() => getActiveApiBaseUrl());
  const [backendReachable, setBackendReachable] = useState<boolean | null>(null);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => getCustomApiUrl() || activeBaseUrl);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const testHealth = async () => {
      try {
        const url = getActiveApiBaseUrl();
        const res = await fetch(`${url}/api/health`, { method: 'GET' });
        if (isMounted) {
          setBackendReachable(res.ok);
        }
      } catch {
        if (isMounted) {
          setBackendReachable(false);
        }
      }
    };
    testHealth();
    return () => {
      isMounted = false;
    };
  }, [activeBaseUrl]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    const target = serverUrlInput.trim().replace(/\/+$/, '');
    if (!target) {
      setTestResult({ ok: false, message: 'Please enter a valid backend URL' });
      setTestingConnection(false);
      return;
    }

    try {
      const res = await fetch(`${target}/api/health`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        setTestResult({
          ok: true,
          message: `Connected successfully! Engine: ${json.service || 'PrintezYour API'}`
        });
      } else {
        setTestResult({
          ok: false,
          message: `Server reached but returned HTTP ${res.status}. Check endpoint path.`
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: `Failed to connect: ${err.message || 'Network error / CORS issue'}. Ensure backend is online.`
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveServerConfig = () => {
    const target = serverUrlInput.trim().replace(/\/+$/, '');
    setCustomApiUrl(target);
    const updated = getActiveApiBaseUrl();
    setActiveBaseUrl(updated);
    setShowServerModal(false);
    setTestResult(null);
  };

  const handleResetServerConfig = () => {
    setCustomApiUrl('');
    const updated = getActiveApiBaseUrl();
    setServerUrlInput(updated);
    setActiveBaseUrl(updated);
    setTestResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email/username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-7 sm:p-8 backdrop-blur-md">
          {/* Official Logo Header */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
            <div className="bg-white rounded-xl px-4 py-2.5 inline-flex items-center justify-center shadow-lg border border-slate-200">
              <img
                src={getAssetUrl('/logo.png')}
                alt="PrintezYour - Official Logo"
                className="h-10 sm:h-11 w-auto object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl('/logo.svg');
                }}
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white font-display">
                Authorized Personnel Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your assigned commercial press credentials to access the business administration system.
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mt-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email / Login ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. superadmin@printezyour.com or username"
                  autoComplete="username"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 text-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-hidden transition-all placeholder:text-slate-600"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your confidential password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 text-white rounded-xl pl-9 pr-10 py-2.5 text-xs focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-hidden transition-all placeholder:text-slate-600"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 focus:outline-hidden"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-cyan-900/40 border-t border-white/20 active:translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Guarantee Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted Session
            </span>
            <span>Role-Based Audit Logging</span>
          </div>
        </div>

        {/* Backend Connectivity Status Strip */}
        <div className="mt-3.5 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 shadow-sm backdrop-blur-xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                backendReachable === true
                  ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                  : backendReachable === false
                  ? 'bg-rose-400 shadow-xs shadow-rose-400/50'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-slate-400">
              API Server:{' '}
              <strong className="text-slate-200 font-mono font-medium truncate max-w-[200px] inline-block align-bottom">
                {activeBaseUrl.replace(/^https?:\/\//, '')}
              </strong>
            </span>
            <button
              type="button"
              onClick={() => setShowServerModal(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer flex items-center gap-1"
            >
              <Settings2 className="w-3 h-3" />
              Configure
            </button>
          </div>
        </div>

        {onExit && (
          <div className="mt-3 text-center">
            <button
              onClick={onExit}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              &larr; Return to Storefront
            </button>
          </div>
        )}
      </div>

      {/* BACKEND SERVER CONFIGURATION MODAL */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Backend Server Configuration</h3>
                <p className="text-[11px] text-slate-400">
                  Configure the production Node.js API server for this client.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  API Base URL
                </label>
                <input
                  type="url"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="e.g. https://api.printezyour.com or https://printezyour.ai.studio"
                  className="w-full bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Leave default or set your Hostinger, VPS, Cloud Run, or custom domain backend.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.ok
                      ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/60 border border-rose-800 text-rose-200'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {testingConnection ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Test Connection</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetServerConfig}
                  className="bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-300 py-2 px-3 rounded-xl text-xs transition-colors"
                >
                  Reset Default
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowServerModal(false);
                  setTestResult(null);
                }}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveServerConfig}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-md shadow-blue-900/40"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL (Exact Mandated Rule) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">Password Reset Assistance</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-medium">
                Password reset is managed by an authorized administrator. Please contact your authorized person or Super Admin to reset your password. We apologize for the inconvenience.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
