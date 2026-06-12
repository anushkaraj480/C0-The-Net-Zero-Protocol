import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Loader2, ArrowLeft, Leaf, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register_role' | 'register_details';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Base fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  
  // Extra fields
  const [location, setLocation] = useState('');
  const [pincode, setPincode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register({
          username,
          email,
          password,
          role,
          phone,
          location,
          pincode,
          company_name: companyName,
        });
      }
      resetForm();
      onClose();
    } catch {
      // Error is set in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('farmer');
    setLocation('');
    setPincode('');
    setCompanyName('');
    setPhone('');
    clearError();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    if (newMode === 'login' || newMode === 'register_role') {
      resetForm();
    }
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setMode('register_details');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-panel p-8 border border-white/10 my-8"
          >
            {mode === 'register_details' && (
              <button
                type="button"
                onClick={() => setMode('register_role')}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 mt-2">
              <h2 className="text-2xl font-bold mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join C0 Net-Zero'}
              </h2>
              <p className="text-sm text-gray-400">
                {mode === 'login'
                  ? 'Sign in to access your carbon portfolio'
                  : mode === 'register_role'
                  ? 'Choose how you want to use the platform'
                  : `Create your ${role === 'farmer' ? 'Land Owner' : 'Buyer'} account`}
              </p>
            </div>

            {mode === 'register_role' ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleRoleSelect('farmer')}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Farmer / Land Owner</h3>
                    <p className="text-sm text-gray-400">I want to verify and sell carbon credits.</p>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect('buyer')}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-accent/50 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Carbon Credit Buyer</h3>
                    <p className="text-sm text-gray-400">I want to offset my company's emissions.</p>
                  </div>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-1 -mx-1">
                {/* Username / Email */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">
                    {mode === 'login' ? 'Username or Email' : 'Username'}
                  </label>
                  <input
                    type="text"
                    name="c0_username"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                    placeholder={mode === 'login' ? 'Username or email' : 'Enter your username'}
                  />
                </div>

                {mode === 'register_details' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                      placeholder="you@example.com"
                    />
                  </motion.div>
                )}

                {/* Password */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="c0_password"
                      autoComplete="off"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === 'register_details' ? 8 : undefined}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Specific Fields */}
                {mode === 'register_details' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-4"
                  >
                    {role === 'buyer' && (
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                          placeholder="Acme Corp"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="City, State / Region"
                      />
                    </div>

                    {role === 'farmer' && (
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">Pincode / Zip Code</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                          placeholder="e.g. 123456"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Contact Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-background font-bold py-3 rounded-lg hover:shadow-[0_0_30px_rgba(0,255,178,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Switch mode */}
            <div className="text-center mt-6 text-sm text-gray-400">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => switchMode(mode === 'login' ? 'register_role' : 'login')}
                className="text-primary hover:underline font-medium"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



