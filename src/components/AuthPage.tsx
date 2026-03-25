import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Shield, LogIn, UserPlus, Play, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials, SignupCredentials } from '../types';
import { cn } from '../lib/utils';

interface AuthPageProps {
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFocused, setIsFocused] = useState('');
  
  const { login, signup, loginAsDemo, isLoading } = useAuth();

  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'pharmacist',
  });

  const handleDemoLogin = async () => {
    setError('');
    setSuccess('');
    
    const success = await loginAsDemo();
    if (success) {
      setSuccess('Demo mode activated! Redirecting...');
      setTimeout(() => onClose?.(), 1000);
    } else {
      setError('Failed to start demo mode');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const success = await login(loginForm);
    if (success) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => onClose?.(), 1000);
    } else {
      setError('Invalid email or password');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    const success = await signup(signupForm);
    if (success) {
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => onClose?.(), 1000);
    } else {
      setError('Email already exists or invalid data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.08, 0.05]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-72 h-72 bg-gray-200 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.05, 0.08]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gray-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.06, 0.1, 0.06]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gray-200 rounded-full blur-3xl"
        />
      </div>

      {/* Main Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Panel - Branding */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:w-2/5 p-12 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 relative overflow-hidden"
            >
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mb-8"
                >
                  <Shield className="w-8 h-8 text-gray-600" />
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold mb-4"
                >
                  MK Pharmacy
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-8"
                >
                  Professional Pharmacy Management
                </motion.p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: "Secure Authentication" },
                    { icon: Zap, text: "Fast Performance" },
                    { icon: Sparkles, text: "Modern Interface" }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <feature.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 bg-gray-300/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                className="absolute -bottom-10 -left-10 w-24 h-24 bg-gray-300/20 rounded-full"
              />
            </motion.div>

            {/* Right Panel - Forms */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:w-3/5 p-12"
            >
              <div className="max-w-md mx-auto">
                {/* Toggle Buttons */}
                <div className="flex mb-8 bg-gray-100 rounded-2xl p-1">
                  <motion.button
                    layout
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                      isLogin
                        ? "bg-white text-gray-800 shadow-lg"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </motion.button>
                  <motion.button
                    layout
                    onClick={() => setIsLogin(false)}
                    className={cn(
                      "flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                      !isLogin
                        ? "bg-white text-gray-800 shadow-lg"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </motion.button>
                </div>

                {/* Demo Login Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <button
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-3 group"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Play className="w-5 h-5" />
                    </motion.div>
                    <span>Try Demo Mode</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Quick access to explore all features
                  </p>
                </motion.div>

                {/* Error/Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-600 text-sm"
                    >
                      {success}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Forms */}
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleLogin}
                      className="space-y-6"
                    >
                      <motion.div
                        animate={{ scale: isFocused === 'email' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'email' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type="email"
                            required
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            onFocus={() => setIsFocused('email')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Enter your email"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ scale: isFocused === 'password' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'password' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            onFocus={() => setIsFocused('password')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                          />
                        ) : 'Sign In'}
                      </motion.button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      onSubmit={handleSignup}
                      className="space-y-6"
                    >
                      <motion.div
                        animate={{ scale: isFocused === 'name' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'name' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type="text"
                            required
                            value={signupForm.name}
                            onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                            onFocus={() => setIsFocused('name')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ scale: isFocused === 'email' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'email' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type="email"
                            required
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            onFocus={() => setIsFocused('email')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Enter your email"
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ scale: isFocused === 'role' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          value={signupForm.role}
                          onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value as any })}
                          onFocus={() => setIsFocused('role')}
                          onBlur={() => setIsFocused('')}
                          className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                        >
                          <option value="pharmacist">Pharmacist</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </motion.div>

                      <motion.div
                        animate={{ scale: isFocused === 'password' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'password' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={signupForm.password}
                            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                            onFocus={() => setIsFocused('password')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Create a password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ scale: isFocused === 'confirmPassword' ? 1.02 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className={cn(
                            "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                            isFocused === 'confirmPassword' ? "text-gray-600" : "text-gray-400"
                          )} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                            onFocus={() => setIsFocused('confirmPassword')}
                            onBlur={() => setIsFocused('')}
                            className="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-gray-50"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                          />
                        ) : 'Create Account'}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-gray-800 hover:text-gray-900 font-medium transition-colors"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
