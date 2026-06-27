import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ─── Tiny helpers ─────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 text-sm';

const HeartIcon = () => (
  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// ─── VIEWS ────────────────────────────────────────────────────
const VIEWS = { LOGIN: 'login', REGISTER: 'register', FORGOT: 'forgot' };

// ═══════════════════════════════════════════════════════════════
export default function LoginPage() {
  const [view, setView] = useState(VIEWS.LOGIN);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <HeartIcon />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ASHA Health System</h1>
          <p className="text-gray-500 text-sm mt-1">Smart Rural Health Monitoring</p>
        </div>

        {view === VIEWS.LOGIN    && <LoginForm   setView={setView} />}
        {view === VIEWS.REGISTER && <RegisterForm setView={setView} />}
        {view === VIEWS.FORGOT   && <ForgotForm   setView={setView} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN FORM
// ═══════════════════════════════════════════════════════════════
function LoginForm({ setView }) {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'Admin' ? '/admin' : '/asha');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input type="text" required className={inputCls} placeholder="Enter username"
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" required className={inputCls} placeholder="Enter password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Links */}
      <div className="flex justify-between mt-5 text-sm">
        <button onClick={() => setView(VIEWS.REGISTER)}
          className="text-green-600 hover:text-green-800 font-medium">
          Register / New User
        </button>
        <button onClick={() => setView(VIEWS.FORGOT)}
          className="text-gray-500 hover:text-gray-700">
          Forgot Password
        </button>
      </div>

      {/* Google sign-up hint */}
      <div className="mt-5 text-center">
        <p className="text-xs text-gray-400 mb-3">Register &amp; Sign up through</p>
        <button
          onClick={() => alert('Google OAuth integration coming soon. Please use Register / New User for now.')}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google Account
        </button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  REGISTER FORM
// ═══════════════════════════════════════════════════════════════
function RegisterForm({ setView }) {
  const empty = {
    name: '', username: '', password: '', confirm_password: '',
    date_of_birth: '', age: '', gender: '', address: '',
    phone: '', email: '',
    ec_name: '', ec_relationship: '', ec_phone: '',
  };
  const [form, setForm]     = useState(empty);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDOB = (e) => {
    const dob = e.target.value;
    const age = dob
      ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000))
      : '';
    setForm({ ...form, date_of_birth: dob, age });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password)
      return setError('Passwords do not match');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters');

    setLoading(true);
    try {
      await api.post('/auth/self-register', {
        name: form.name, username: form.username, password: form.password,
        date_of_birth: form.date_of_birth || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
        phone: form.phone, email: form.email || undefined,
        emergency_contact: (form.ec_name || form.ec_phone) ? {
          name: form.ec_name, relationship: form.ec_relationship, phone: form.ec_phone,
        } : undefined,
      });
      setSuccess('Registration submitted! Your account will be activated once the admin approves it.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value }),
  });

  if (success) return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">✅</div>
      <Alert type="success">{success}</Alert>
      <button onClick={() => setView(VIEWS.LOGIN)}
        className="mt-4 w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700">
        Back to Login
      </button>
    </div>
  );

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">ASHA Worker Registration</h2>
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

        <Section title="Personal Information">
          <Row>
            <Field label="Full Name *">
              <input className={inputCls} required placeholder="Full name" {...f('name')} />
            </Field>
            <Field label="Gender">
              <select className={inputCls} {...f('gender')}>
                <option value="">Select</option>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </Field>
          </Row>
          <Row>
            <Field label="Date of Birth">
              <input type="date" className={inputCls} value={form.date_of_birth}
                onChange={handleDOB} max={new Date().toISOString().split('T')[0]} />
            </Field>
            <Field label="Age">
              <input type="number" className={inputCls} placeholder="Age" min={18} max={65} {...f('age')} />
            </Field>
          </Row>
          <Field label="Address">
            <textarea className={inputCls} rows={2} placeholder="Full address" {...f('address')} />
          </Field>
        </Section>

        <Section title="Contact Information">
          <Row>
            <Field label="Mobile Number *">
              <input type="tel" className={inputCls} required placeholder="10-digit mobile" {...f('phone')} />
            </Field>
            <Field label="Email Address">
              <input type="email" className={inputCls} placeholder="email@example.com" {...f('email')} />
            </Field>
          </Row>
        </Section>

        <Section title="Emergency Contact">
          <Row>
            <Field label="Contact Name">
              <input className={inputCls} placeholder="Name" {...f('ec_name')} />
            </Field>
            <Field label="Relationship">
              <input className={inputCls} placeholder="e.g. Husband" {...f('ec_relationship')} />
            </Field>
          </Row>
          <Field label="Contact Phone">
            <input type="tel" className={inputCls} placeholder="Mobile number" {...f('ec_phone')} />
          </Field>
        </Section>

        <Section title="Account Credentials">
          <Field label="Username *">
            <input className={inputCls} required placeholder="Choose a username" {...f('username')} />
          </Field>
          <Row>
            <Field label="Password *">
              <input type="password" className={inputCls} required minLength={6}
                placeholder="Min 6 characters" {...f('password')} />
            </Field>
            <Field label="Confirm Password *">
              <input type="password" className={inputCls} required minLength={6}
                placeholder="Repeat password" {...f('confirm_password')} />
            </Field>
          </Row>
        </Section>

        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠️ Your account will be reviewed by the admin before activation.
        </p>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => setView(VIEWS.LOGIN)}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Back to Login
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  FORGOT PASSWORD FORM (OTP via mobile)
// ═══════════════════════════════════════════════════════════════
function ForgotForm({ setView }) {
  const [step, setStep]     = useState(1);
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState('');
  const [newPw, setNewPw]   = useState('');
  const [error, setError]   = useState('');
  const [info, setInfo]     = useState('');
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setInfo('OTP sent to your email address. Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with this email.');
    } finally { setLoading(false); }
  };

  const verifyOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp, new_password: newPw });
      setInfo('Password reset successfully! You can now login.');
      setTimeout(() => setView(VIEWS.LOGIN), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Forgot Password</h2>
      {error && <Alert type="error">{error}</Alert>}
      {info  && <Alert type="success">{info}</Alert>}

      {step === 1 && (
        <form onSubmit={sendOTP} className="space-y-4">
          <Field label="Registered Email Address">
            <input type="email" className={inputCls} required
              placeholder="Enter your email address"
              value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={verifyOTP} className="space-y-4">
          <Field label="Enter OTP (check your email)">
            <input type="text" className={inputCls} required
              placeholder="6-digit OTP" maxLength={6}
              value={otp} onChange={e => setOtp(e.target.value)} />
          </Field>
          <Field label="New Password">
            <input type="password" className={inputCls} required minLength={6}
              placeholder="Min 6 characters"
              value={newPw} onChange={e => setNewPw(e.target.value)} />
          </Field>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-60">
            {loading ? 'Verifying...' : 'Reset Password'}
          </button>
        </form>
      )}

      <button onClick={() => setView(VIEWS.LOGIN)}
        className="mt-4 w-full text-sm text-gray-500 hover:text-gray-700">
        ← Back to Login
      </button>
    </>
  );
}

// ─── Layout helpers ───────────────────────────────────────────
const Section = ({ title, children }) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
    <div className="space-y-3">{children}</div>
  </div>
);
const Row  = ({ children }) => <div className="grid grid-cols-2 gap-3">{children}</div>;
const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);
const Alert = ({ type, children }) => {
  const cls = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-green-50 border-green-200 text-green-700';
  return <div className={`border rounded-lg px-4 py-3 mb-3 text-sm ${cls}`}>{children}</div>;
};
