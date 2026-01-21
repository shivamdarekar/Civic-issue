"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, Building2, Shield, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { authService } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, clearError } from "@/redux/slices/authSlice";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type UserRole = "FIELD_WORKER" | "WARD_ENGINEER" | "ZONE_OFFICER" | "SUPER_ADMIN" | null;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { loading: authLoading, error: authError } = useAppSelector((state) => state.auth);
  
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const roleInfo = {
    FIELD_WORKER: {
      title: t('role.field.worker'),
      icon: <HardHat className="w-8 h-8" />,
      description: t('role.field.worker.desc')
    },
    WARD_ENGINEER: {
      title: t('role.ward.engineer'),
      icon: <Building2 className="w-8 h-8" />,
      description: t('role.ward.engineer.desc')
    },
    ZONE_OFFICER: {
      title: t('role.zone.officer'),
      icon: <Image src="/VMC.webp" alt="VMC" width={32} height={32} className="w-8 h-8 object-contain" />,
      description: t('role.zone.officer.desc')
    },
    SUPER_ADMIN: {
      title: t('role.admin'),
      icon: <Shield className="w-8 h-8" />,
      description: t('role.admin.desc')
    }
  };

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setCredentials({ email: "", password: "" });
    dispatch(clearError());
  }

  async function handleFormLogin(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      
      if (result) {
        const dashboardUrl = authService.getDashboardUrl(result.role);
        router.push(dashboardUrl);
      }
    } catch (error) {
      // Error is already set in Redux state
      console.error('Login error:', error);
    }
  }

  function handleBack() {
    setSelectedRole(null);
    setCredentials({ email: "", password: "" });
    dispatch(clearError());
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-200">
                <Image 
                  src="/VMC.webp" 
                  alt="VMC Logo" 
                  width={48} 
                  height={48} 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              {t('app.title')}
            </h1>
            <p className="text-gray-600 text-lg">
              {!selectedRole 
                ? t('login.select.role')
                : `${t('login.signin.as')} ${roleInfo[selectedRole].title}`}
            </p>
          </div>

          {!selectedRole ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <RoleCard
                icon={<HardHat className="w-8 h-8" />}
                title={t('role.field.worker')}
                description={t('role.field.worker.desc')}
                onClick={() => handleRoleSelect("FIELD_WORKER")}
                bgColor="bg-yellow-50 border-yellow-200"
              />
              
              <RoleCard
                icon={<Building2 className="w-8 h-8" />}
                title={t('role.ward.engineer')}
                description={t('role.ward.engineer.desc')}
                onClick={() => handleRoleSelect("WARD_ENGINEER")}
                bgColor="bg-gray-100 border-gray-300"
              />
              
              <RoleCard
                icon={<Image src="/VMC.webp" alt="VMC" width={32} height={32} className="w-8 h-8 object-contain" />}
                title={t('role.zone.officer')}
                description={t('role.zone.officer.desc')}
                onClick={() => handleRoleSelect("ZONE_OFFICER")}
                bgColor="bg-white border-gray-200"
              />
              
              <RoleCard
                icon={<Shield className="w-8 h-8" />}
                title={t('role.admin')}
                description={t('role.admin.desc')}
                onClick={() => handleRoleSelect("SUPER_ADMIN")}
                bgColor="bg-yellow-50 border-yellow-200"
              />
            </div>
          ) : selectedRole ? (
            <div className="max-w-md mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-blue-600">
                    {roleInfo[selectedRole].icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {roleInfo[selectedRole].title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {roleInfo[selectedRole].description}
                    </p>
                  </div>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleFormLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('login.password')}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('login.password')}
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="bg-white border-gray-300 text-gray-800 placeholder:text-gray-400 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 bg-white text-blue-600" 
                      />
                      {t('login.remember')}
                    </label>
                    <Link 
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t('login.forgot')}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    {authLoading ? (
                      <>
                        <img src="/VMC.webp" alt="Loading" className="w-4 h-4 animate-pulse mr-2" />
                        Logging in...
                      </>
                    ) : (
                      t('login.signin')
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors pt-4 border-t border-gray-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('login.change.role')}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  bgColor?: string;
}

function RoleCard({ icon, title, description, onClick, bgColor = "bg-white border-gray-200" }: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${bgColor} border rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all text-left group`}
    >
      <div className="mb-4 text-blue-600 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </button>
  );
}
