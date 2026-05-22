import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Loader2, User, Building2, Phone, Briefcase, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loginType, setLoginType] = useState<'individual' | 'organisation'>('individual');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Save designation for frontend custom display
      if (loginType === 'organisation' && designation.trim()) {
        sessionStorage.setItem('c0_user_designation', designation);
      }
      
      // Call register (which auto-logs in the user on success)
      await register(username, email, password, role, phone);
      
      // Close modal on success
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
    setPhone('');
    setDesignation('');
    setPassword('');
    setRole(loginType === 'individual' ? 'farmer' : 'industrial_buyer');
    clearError();
  };

  const handleTypeChange = (type: 'individual' | 'organisation') => {
    setLoginType(type);
    setRole(type === 'individual' ? 'farmer' : 'industrial_buyer');
    clearError();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-panel p-8 border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Top glowing gradient stripe */}
            <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${
              loginType === 'individual' ? 'from-primary to-accent' : 'from-accent to-secondary'
            }`} />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to C0 Net-Zero</h2>
              <p className="text-sm text-gray-400">
                Configure your {loginType} profile to access the carbon protocol
              </p>
            </div>

            {/* Type Selector (Individual vs Organisation Toggle) */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => handleTypeChange('individual')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginType === 'individual' 
                    ? 'bg-primary text-background shadow-lg shadow-primary/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Individual
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('organisation')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginType === 'organisation' 
                    ? 'bg-accent text-background shadow-lg shadow-accent/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> Organisation
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* --- INDIVIDUAL FORM --- */}
              {loginType === 'individual' && (
                <>
                  {/* Username */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="individual-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="john_doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="individual-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="individual-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input
                        id="individual-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* --- ORGANISATION FORM --- */}
              {loginType === 'organisation' && (
                <>
                  {/* Company Name */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="organisation-company"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-gray-600"
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  {/* Individual Designation */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Your Designation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="organisation-designation"
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-gray-600"
                        placeholder="Sustainability Manager"
                      />
                    </div>
                  </div>

                  {/* Corporate Email */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Corporate Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="organisation-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-gray-600"
                        placeholder="admin@company.com"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        id="organisation-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-accent transition-colors placeholder:text-gray-600"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input
                        id="organisation-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white outline-none focus:border-accent transition-colors placeholder:text-gray-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Corporate Profile dropdown */}
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Corporate Profile</label>
                    <select
                      id="organisation-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent [&>option]:bg-[#0B0F1A]"
                    >
                      <option value="industrial_buyer">Industrial Buyer</option>
                      <option value="agro_firm">Agro Firm</option>
                      <option value="ngo">NGO</option>
                    </select>
                  </div>
                </>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit CTA button */}
              <button
                id="auth-submit"
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer ${
                  loginType === 'individual' 
                    ? 'bg-primary text-background hover:shadow-[0_0_30px_rgba(0,255,178,0.4)]' 
                    : 'bg-accent text-background hover:shadow-[0_0_30px_rgba(0,207,255,0.4)]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  loginType === 'individual' ? 'Access Portal' : 'Register Corporate Node'
                )}
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-gray-500 font-mono tracking-widest uppercase">
              C0 Net-Zero Secure Gateway
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
