'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { departmentService } from '@/services/departmentService';
import { Department, Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [studyingYear, setStudyingYear] = useState('TE');
  const [role, setRole] = useState<Role>('STUDENT');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const user = authService.getCurrentUser();
    if (user) {
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      return;
    }

    departmentService
      .getAllDepartments()
      .then((data) => {
        setDepartments(data);
        if (data.length > 0) setDepartmentId(data[0].id);
      })
      .catch(() => {});
  }, [router]);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim().toLowerCase();
    return trimmed.endsWith('@tcetmumbai.org') && trimmed.length > '@tcetmumbai.org'.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Client-side domain validation
    if (!validateEmail(email)) {
      setError('Only valid @tcetmumbai.org institutional email addresses are permitted.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          setError('Please provide your full legal name.');
          setIsLoading(false);
          return;
        }

        const res = await authService.register({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          departmentId,
          studyingYear: role === 'STUDENT' ? studyingYear : undefined,
          role,
        });

        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => {
          router.push(res.user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }, 500);
      } else {
        const res = await authService.login({
          email: email.trim().toLowerCase(),
          password,
        });

        router.push(res.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#F8FAFC] overflow-hidden">
      {/* Background Decorative Graphic Floating Cards matching Reference Image 1 (Adoraxe composition) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40 lg:opacity-80">
        {/* Top Left Floating Lab Polaroid */}
        <div className="absolute -top-12 -left-12 w-64 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 rotate-[-8deg] transition-transform hidden sm:block">
          <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100">
            <Image
              src="/images/college_photo.png"
              alt="TCET Main Campus"
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-bold text-slate-700">TCET Central Campus</span>
            <span>Kandivali (E)</span>
          </div>
        </div>

        {/* Top Right Floating Lab Card */}
        <div className="absolute top-10 -right-8 w-60 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 rotate-[6deg] transition-transform hidden sm:block">
          <div className="h-36 rounded-xl bg-slate-900 p-3 flex flex-col justify-between text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Department of IoT
            </span>
            <div>
              <p className="text-xs font-bold">Room 529 Lab</p>
              <p className="text-[10px] text-slate-400">Microcontrollers & Sensors</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">IoT Embedded Rig</span>
            <span className="text-emerald-600 font-bold">Available</span>
          </div>
        </div>

        {/* Bottom Left Floating Lab Card */}
        <div className="absolute bottom-6 left-8 w-56 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 rotate-[4deg] transition-transform hidden md:block">
          <div className="h-28 rounded-xl bg-[#193A71] p-3 flex flex-col justify-between text-white">
            <span className="text-[10px] font-bold text-blue-200">COMP / IT Labs</span>
            <div>
              <p className="text-xs font-bold">Room 304, 305, 306</p>
              <p className="text-[10px] text-slate-300">High-Performance Computing</p>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
            <span>Room 304</span>
            <span className="font-bold text-[#193A71]">Confirmed</span>
          </div>
        </div>

        {/* Bottom Right Floating Card */}
        <div className="absolute -bottom-10 right-10 w-64 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 rotate-[-5deg] transition-transform hidden md:block">
          <div className="h-32 rounded-xl bg-slate-800 p-3 flex flex-col justify-between text-white">
            <span className="text-[10px] font-bold text-purple-300">AI & Data Science</span>
            <div>
              <p className="text-xs font-bold">Room 309, 310, 413</p>
              <p className="text-[10px] text-slate-400">Deep Learning Workstations</p>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Active Lab Lending Track</div>
        </div>
      </div>

      {/* Central Login / Register Card matching Adoraxe Composition */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-8 sm:p-9 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-2">
            <Image
              src="/images/logo.png"
              alt="TCET Mumbai Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegisterMode ? 'Institutional Enrollment' : 'Welcome back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegisterMode
              ? 'Register with your verified institutional email'
              : 'Sign in to access laboratory equipment and loan tracking.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="mt-6 p-1 bg-slate-100 rounded-xl flex items-center text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              !isRegisterMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              isRegisterMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-700 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          {/* Full Name (Registration only) */}
          {isRegisterMode && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
                />
              </div>
            </div>
          )}

          {/* Institutional Email */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Institutional Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rollnumber@tcetmumbai.org"
                className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-[#E6771C]" />
              Must end with @tcetmumbai.org
            </p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Registration Fields: Department, Year, Role */}
          {isRegisterMode && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {/* Department Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      value={departmentId || ''}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="ADMIN">Lab Administrator</option>
                  </select>
                </div>
              </div>

              {role === 'STUDENT' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Studying Year
                  </label>
                  <select
                    value={studyingYear}
                    onChange={(e) => setStudyingYear(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50/60 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
                  >
                    <option value="FE">First Year (FE)</option>
                    <option value="SE">Second Year (SE)</option>
                    <option value="TE">Third Year (TE)</option>
                    <option value="BE">Final Year (BE)</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] transition-colors shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Validating Institutional ID...
              </span>
            ) : (
              <>
                <span>{isRegisterMode ? 'Complete Enrollment' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500">
            Thakur College of Engineering and Technology
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Autonomous Institute Affiliated to University of Mumbai • TCET Mumbai
          </p>
        </div>
      </div>
    </div>
  );
}
