'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  Search,
  CalendarCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Camera,
  School,
  Lock,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { departmentService } from '@/services/departmentService';
import { Department, User } from '@/types';

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    departmentService
      .getAllDepartments()
      .then((data) => setDepartments(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const totalRooms = departments.reduce((acc, d) => acc + (d.rooms?.length || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/images/logo.png"
                alt="TCET Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-[#193A71] tracking-tight">
                  TCET
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#E6771C]/10 text-[#E6771C] font-bold">
                  Lab Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Thakur College of Engineering & Technology
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 text-xs font-bold text-[#193A71] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-colors shadow-sm"
                  >
                    Admin Portal
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-colors shadow-sm"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#E6771C]" />
                <span className="text-xs font-bold text-slate-700">
                  Restricted to verified @tcetmumbai.org institutional accounts
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Your Lab.{' '}
                <span className="text-[#193A71]">Your Equipment.</span>{' '}
                <span className="text-[#E6771C]">One Place.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Find laboratory equipment, request what you need, and track every loan
                from pickup to return.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href={user ? '/dashboard' : '/login'}
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  <span>{user ? 'Enter Dashboard' : 'Sign In with Institutional ID'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  How It Works
                </a>
              </div>

              {/* Institutional Department Status Indicators */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {departments.length || 11}
                  </span>{' '}
                  Academic Departments
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {totalRooms || 22}
                  </span>{' '}
                  Specialized Engineering Labs
                </div>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  Live Neon Storage & PostgreSQL
                </div>
              </div>
            </div>

            {/* Right Column: TCET Campus Reference Photograph */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-100 aspect-[4/3]">
                <Image
                  src="/images/college_photo.png"
                  alt="Thakur College of Engineering and Technology (TCET) Campus"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
                      Central Engineering Laboratory Facility
                    </span>
                  </div>
                  <h3 className="text-base font-bold">Thakur College of Engineering & Technology</h3>
                  <p className="text-xs text-slate-300">Kandivali (East), Mumbai - 400101</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#E6771C] uppercase tracking-wider">
              Streamlined Equipment Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              How Lab Lending Operates
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Designed for TCET undergraduate practicals, capstone research projects, and faculty labs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#193A71] flex items-center justify-center font-black text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Discover Lab & Equipment
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse allocated laboratory rooms by department (COMP, IT, AI&ML, AI&DS, IoT, Cyber Security, MME).
                  View live photos and current working quantities.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
                <Search className="w-4 h-4 mr-1.5 text-slate-400" />
                Filter by category or room
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#E6771C] flex items-center justify-center font-black text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Request with Purpose
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submit a structured loan request specifying required units, pickup time, return deadline,
                  and academic project details. Avoids over-allocation.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
                <CalendarCheck className="w-4 h-4 mr-1.5 text-slate-400" />
                Atomic reservation locking
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Inspection & Check-In
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Return loaned instruments on time. Condition is recorded (Working, Damaged, or Needs Maintenance)
                  and instantly updates real-time availability.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Instant inventory restoration
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Architectural Capabilities */}
      <section className="py-14 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#193A71] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Domain Enforcement</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Spring Security strictly validates @tcetmumbai.org accounts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E6771C] flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Neon Object Storage</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live camera capture uploads directly to public lab-photos bucket.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Concurrency Control</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pessimistic DB row locking prevents over-subscribing stock.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Official Department Seed</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  COMP, IT, AI&ML, AI&DS, CYBER, IOT, MME mappings preserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-3">
            <div className="relative w-7 h-7">
              <Image
                src="/images/logo.png"
                alt="TCET Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-white font-bold">Thakur College of Engineering and Technology</p>
              <p className="text-[10px] text-slate-400">Autonomous Institute Affiliated to University of Mumbai</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/login" className="hover:text-white transition-colors">
              Institutional Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Inventory Dashboard
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
