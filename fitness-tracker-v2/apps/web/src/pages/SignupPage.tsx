import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usage, colors } from '../lib/theme';
import { DebugInfo } from '../components/DebugInfo';
import { useSecureFormValidation, validationRules, validatePasswordMatch, validateTermsAcceptance } from '../hooks/useSecureFormValidation';
import { useRateLimit } from '../components/security/SecurityProvider';

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signup, signInWithGoogle } = useAuth();
  
  // Enhanced security validation
  const signupValidationRules = {
    fullName: validationRules.fullName,
    email: validationRules.email,
    password: validationRules.password,
    confirmPassword: validationRules.confirmPassword,
    terms: { custom: validateTermsAcceptance }
  };
  
  const { validateForm, errors, setError: setValidationError } = useSecureFormValidation(signupValidationRules);
  const { checkLimit, isBlocked } = useRateLimit('signup', 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check rate limiting
    if (!checkLimit()) {
      setError('Too many signup attempts. Please try again later.');
      return;
    }
    
    // Enhanced validation
    const isValid = validateForm(formData);
    if (!isValid) {
      // Check for password match specifically
      const passwordMatchError = validatePasswordMatch(formData.password, formData.confirmPassword);
      if (passwordMatchError) {
        setValidationError('confirmPassword', passwordMatchError);
      }
      return;
    }
    
    setLoading(true);
    try {
      console.log('Starting signup process...');
      const result = await signup(formData.email, formData.password, formData.fullName);
      if (result.success) {
        console.log('Signup successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error in component:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      console.log('Starting Google sign-in...');
      const success = await signInWithGoogle();
      if (success) {
        console.log('Google sign-in successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.error('Google sign-in failed');
        setError('Failed to sign in with Google. Please check your internet connection and try again.');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups and try again.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient relative flex">
      {/* Left side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glassmorphism rounded-3xl p-12 w-full max-w-md">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SIGN UP</h1>
            <div className="w-16 h-0.5 bg-white mx-auto"></div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-600/90 border border-red-500 text-white rounded-lg text-sm font-medium shadow-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block high-contrast-label text-sm mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 high-contrast-input rounded-xl focus:outline-none backdrop-blur-sm"
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70">
                  ***
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block high-contrast-label text-sm mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 high-contrast-input rounded-xl focus:outline-none backdrop-blur-sm"
                  placeholder="Enter your email"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70">
                  ***
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block high-contrast-label text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 high-contrast-input rounded-xl focus:outline-none backdrop-blur-sm"
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                  <span className="text-white/70">***</span>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block high-contrast-label text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 high-contrast-input rounded-xl focus:outline-none backdrop-blur-sm"
                  placeholder="Confirm your password"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                  <span className="text-white/70">***</span>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-white/30 focus:ring-2"
                required
              />
              <label htmlFor="terms" className="high-contrast-text text-sm">
                I agree to the <span className="text-yellow-300 cursor-pointer hover:text-yellow-200 font-medium">Terms and Conditions</span> and <span className="text-yellow-300 cursor-pointer hover:text-yellow-200 font-medium">Privacy Policy</span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent high-contrast-text">Or Continue With</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center space-x-3 bg-white/20 border-2 border-white/40 text-white py-3 px-8 rounded-xl hover:bg-white/30 hover:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Signing in...' : 'Google'}</span>
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="high-contrast-text">
                Already have an account? <Link to="/login" className="text-yellow-300 cursor-pointer hover:text-yellow-200 font-bold">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Fitness Image */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 rounded-l-3xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Fitness training session with personal trainer and client doing push-ups"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-blue-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-blue-500/30 flex items-center justify-center">
            <div className="text-center text-white/90">
              <h3 className="text-3xl font-bold mb-2">Join Our Community</h3>
              <p className="text-xl">Start your fitness journey today</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Debug Info - Only shows in development */}
      <DebugInfo />
    </div>
  );
}
