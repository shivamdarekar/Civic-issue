"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, User, Eye, EyeOff, ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { authService } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, clearAuthError } from "@/redux";
import Header from "@/components/auth/Header";
import Footer from "@/components/auth/Footer";
import VMCLoader from "@/components/ui/VMCLoader";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { loading: authLoading, error: authError } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.userState);
  
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      const dashboardUrl = authService.getDashboardUrl(user.role);
      router.push(dashboardUrl);
      return;
    }
    
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch, user, router]);

  async function handleFormLogin(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      if (result) {
        // Navigate to appropriate dashboard based on role
        const dashboardUrl = authService.getDashboardUrl(result.role);
        router.push(dashboardUrl);
      }
    } catch (error) {
      // Error is handled by Redux
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="max-w-5xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                  <Image 
                    src="/VMC.webp" 
                    alt="VMC Logo" 
                    width={64} 
                    height={64} 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t('app.title') || 'VMC CiviSense'}
                </span>
              </h1>
              <h2 className="text-xl lg:text-2xl font-semibold text-blue-700 mb-6">
                Vadodara Municipal Corporation
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Secure access portal for municipal staff and administrators
              </p>
              
              {/* Features */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Real-time issue tracking</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Mobile-first design</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Offline capability</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="max-w-md mx-auto w-full">
              <div className="bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Lock className="w-4 h-4" />
                    Secure Login
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Welcome Back
                  </h3>
                  <p className="text-gray-600">
                    Sign in to access your dashboard
                  </p>
                </div>

                {authError && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    </div>
                    <p className="text-sm">{authError}</p>
                  </div>
                )}

                <form onSubmit={handleFormLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="engineer@vmc.gov.in"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="h-12 bg-white border-2 border-gray-200 focus:border-blue-500 transition-all rounded-xl text-gray-900 placeholder:text-gray-500"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="h-12 bg-white border-2 border-gray-200 focus:border-blue-500 transition-all rounded-xl pr-12 text-gray-900 placeholder:text-gray-500"
                        autoComplete="current-password"
                        data-1p-ignore
                        data-lpignore="true"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300" />
                      Remember me
                    </label>
                    <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="flex items-center gap-2">
                        <VMCLoader size={16} />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                    Protected by VMC Security • Government Use Only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
