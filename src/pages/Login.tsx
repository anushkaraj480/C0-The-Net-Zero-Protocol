import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Building, ArrowRight, User, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [loginType, setLoginType] = useState<'individual' | 'organisation'>('individual');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 relative overflow-y-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-50 mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] opacity-50 mix-blend-screen" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-block mb-8 text-gray-400 hover:text-white transition-colors">
          ← Back to Home
        </Link>
        
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Access your carbon management dashboard</p>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-8">
            <button
              onClick={() => setLoginType('individual')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                loginType === 'individual' ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Individual
            </button>
            <button
              onClick={() => setLoginType('organisation')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                loginType === 'organisation' ? 'bg-secondary text-background shadow-lg shadow-secondary/20' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" /> Organisation
            </button>
          </div>

          <div className={`relative transition-all duration-300 ${loginType === 'individual' ? 'min-h-[300px]' : 'min-h-[460px]'}`}>
            <AnimatePresence mode="wait">
              {loginType === 'individual' ? (
                <motion.form
                  key="individual"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 absolute w-full"
                >
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm text-gray-400">Password</label>
                      <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-white text-background py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex justify-center items-center gap-2 mt-8">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="organisation"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4 absolute w-full"
                >
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Acme Corp"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Your Designation</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Sustainability Manager"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Corporate Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="email" 
                        placeholder="admin@acmecorp.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-secondary text-background py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-8">
                    Sign In to Portal <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
