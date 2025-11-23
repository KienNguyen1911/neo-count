import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { NeoButton, NeoInput, NeoLabel } from './ui/NeoComponents';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        // Sign Up Logic
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setSuccessMsg("Identity created! Check your email to confirm access.");
      } else {
        // Login Logic
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neo-bg p-4 relative overflow-hidden font-sans">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-neo-yellow rounded-full border-4 border-neo-black opacity-20" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-neo-blue rounded-full border-4 border-neo-black opacity-20" />

      <div className="max-w-md w-full bg-neo-white border-4 border-neo-black shadow-neo relative z-10 transition-all duration-300">
        
        {/* Header Section */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-neo-black text-neo-white text-3xl font-black flex items-center justify-center mx-auto mb-4 rounded-xl shadow-neo-sm transform -rotate-3">
            N
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-6">NeoCount</h1>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-y-4 border-neo-black">
          <button
            onClick={() => { setIsSignUp(false); setError(null); setSuccessMsg(null); }}
            className={cn(
              "flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all",
              !isSignUp ? "bg-neo-yellow text-neo-black" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            )}
          >
            Login
          </button>
          <div className="w-1 bg-neo-black"></div>
          <button
            onClick={() => { setIsSignUp(true); setError(null); setSuccessMsg(null); }}
            className={cn(
              "flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-all",
              isSignUp ? "bg-neo-green text-neo-black" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            )}
          >
            Sign Up
          </button>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
            
            {/* Error / Success Messages */}
            {error && (
              <div className="bg-neo-red/20 border-2 border-neo-red p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neo-red shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-neo-red leading-tight">{error}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="bg-neo-green/20 border-2 border-neo-green p-3 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-neo-green/80 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-neo-green/80 leading-tight">{successMsg}</p>
              </div>
            )}

            <div>
              <NeoLabel htmlFor="email">Email Access</NeoLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <NeoInput 
                  id="email" 
                  type="email" 
                  placeholder="user@neocount.app"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <NeoLabel htmlFor="password">Security Key</NeoLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <NeoInput 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <NeoButton 
              type="submit" 
              disabled={loading}
              className={cn(
                "w-full mt-2 transition-colors",
                isSignUp ? "bg-neo-green hover:bg-green-400" : "bg-neo-yellow hover:bg-yellow-300"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : isSignUp ? (
                "Create Identity"
              ) : (
                "Enter Vault"
              )}
            </NeoButton>
          </form>

          {/* Divider */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-dashed border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neo-white px-2 font-bold text-gray-400">Or connect with</span>
            </div>
          </div>

          <NeoButton 
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin} 
            className="w-full flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Account
          </NeoButton>

          <div className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Secure Connection via Supabase
          </div>
        </div>
      </div>
    </div>
  );
};