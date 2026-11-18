import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, User, Briefcase, ArrowRight, AlertCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    professionalTitle: '',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please provide your name, email, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(formData);
      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your workspace</h2>
          <p className="mt-1 text-sm text-slate-400">
            Start managing clients, projects, tasks, and invoices seamlessly
          </p>
        </div>

        {/* Card */}
        <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-2xl">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Professional Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="professionalTitle"
                    value={formData.professionalTitle}
                    onChange={handleChange}
                    placeholder="Full Stack Architect"
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@freelance.dev"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Morgan Creative Studio"
                  className="w-full py-2.5 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Default Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full py-2.5 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 py-2.5 px-4 mt-6 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 mt-6 text-center border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

