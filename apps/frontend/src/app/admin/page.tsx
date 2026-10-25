'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  Layers,
  Clock,
  Package,
  AlertTriangle,
  RotateCcw,
  Plus,
  Camera,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  Building2,
  Wrench,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { authService } from '@/services/authService';
import { departmentService } from '@/services/departmentService';
import { roomService } from '@/services/roomService';
import { requestService } from '@/services/requestService';
import { rentalService } from '@/services/rentalService';
import { damageService } from '@/services/damageService';
import { dashboardService } from '@/services/dashboardService';
import {
  Department,
  Room,
  Equipment,
  User,
  DashboardSummary,
  RentalRequest,
  Rental,
  DamageReport,
} from '@/types';
import { AddRoomModal } from '@/components/modal/AddRoomModal';
import { AddEquipmentModal } from '@/components/modal/AddEquipmentModal';
import { PhotoUploadModal } from '@/components/photo/PhotoUploadModal';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Admin Section: 'requests' | 'inventory' | 'rentals' | 'damage' | 'departments'
  const [activeTab, setActiveTab] = useState<
    'requests' | 'inventory' | 'rentals' | 'damage' | 'departments'
  >('requests');

  // Lists
  const [pendingRequests, setPendingRequests] = useState<RentalRequest[]>([]);
  const [overdueRentals, setOverdueRentals] = useState<Rental[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [roomEquipment, setRoomEquipment] = useState<Equipment[]>([]);

  // Modals
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // Search filter for department selector matching Reference 2
  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Rejection prompt state
  const [rejectingReqId, setRejectingReqId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Initial Auth & Data Load
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);

    // Fetch Summary & Departments
    Promise.all([dashboardService.getSummary(), departmentService.getAllDepartments()])
      .then(([summaryData, deptsData]) => {
        setSummary(summaryData);
        setDepartments(deptsData);
        if (deptsData.length > 0) {
          setSelectedDepartment(deptsData[0]);
          if (deptsData[0].rooms && deptsData[0].rooms.length > 0) {
            setSelectedRoom(deptsData[0].rooms[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load admin initial data', err))
      .finally(() => setIsLoading(false));
  }, [router]);

  // Load Tab Data
  const loadTabContent = useCallback(async () => {
    try {
      if (activeTab === 'requests') {
        const reqs = await requestService.getAllRequests('PENDING');
        setPendingRequests(reqs);
      } else if (activeTab === 'rentals') {
        const overdue = await rentalService.getOverdueRentals();
        setOverdueRentals(overdue);
      } else if (activeTab === 'damage') {
        const reports = await damageService.getAllReports();
        setDamageReports(reports);
      } else if (activeTab === 'inventory' && selectedRoom) {
        const eq = await roomService.getRoomEquipment(selectedRoom.id);
        setRoomEquipment(eq);
      }
    } catch (err) {
      console.error('Failed to refresh tab content', err);
    }
  }, [activeTab, selectedRoom]);

  useEffect(() => {
    loadTabContent();
  }, [loadTabContent]);

  // Handle Request Approval
  const handleApprove = async (requestId: number) => {
    try {
      await requestService.approveRequest(requestId);
      setActionMsg({ type: 'success', text: `Request #${requestId} approved successfully!` });
      loadTabContent();
      dashboardService.getSummary().then((s) => setSummary(s));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionMsg({ type: 'error', text: e.message || 'Approval failed' });
    }
  };

  // Handle Request Rejection
  const handleReject = async (requestId: number) => {
    if (!rejectReason.trim()) {
      setActionMsg({ type: 'error', text: 'Please enter a rejection reason.' });
      return;
    }
    try {
      await requestService.rejectRequest(requestId, rejectReason.trim());
      setActionMsg({ type: 'success', text: `Request #${requestId} rejected.` });
      setRejectingReqId(null);
      setRejectReason('');
      loadTabContent();
      dashboardService.getSummary().then((s) => setSummary(s));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionMsg({ type: 'error', text: e.message || 'Rejection failed' });
    }
  };

  // Handle Room 413 Confirmation
  const handleConfirmRoom = async (roomId: number) => {
    try {
      await roomService.confirmRoom(roomId);
      setActionMsg({
        type: 'success',
        text: 'Room assignment confirmed and registered in institutional records!',
      });
      // Refresh departments
      const depts = await departmentService.getAllDepartments();
      setDepartments(depts);
      if (selectedRoom?.id === roomId) {
        const updated = await roomService.getRoomById(roomId);
        setSelectedRoom(updated);
      }
      dashboardService.getSummary().then((s) => setSummary(s));
    } catch (err: unknown) {
      const e = err as { message?: string };
      setActionMsg({ type: 'error', text: e.message || 'Failed to confirm room' });
    }
  };

  // Filtered departments based on search
  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-9 h-9">
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
                <span className="text-sm font-extrabold text-[#193A71] tracking-tight">
                  TCET Lab Administration
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-800">
                  ADMIN PORTAL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Student View
            </Link>

            <button
              onClick={() => {
                authService.logout();
                router.push('/login');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {/* Action / Alert Message Banner */}
        {actionMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fade-in ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {actionMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionMsg.text}</span>
            </div>
            <button
              onClick={() => setActionMsg(null)}
              className="text-slate-400 hover:text-slate-700 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Room 413 Duplicate Assignment Flag Banner */}
        {summary && summary.unconfirmedRooms > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Administrative Confirmation Required: Room 413 Assignment
                </h3>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Room 413 appears under both AI&ML and AI&DS. Institutional policy requires administrator
                  confirmation for shared equipment access rather than automatic database merging.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                // Find Room 413 ID across departments
                const r413 = departments
                  .flatMap((d) => d.rooms || [])
                  .find((r) => r.roomNumber === '413' && !r.isConfirmed);
                if (r413) handleConfirmRoom(r413.id);
              }}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shrink-0 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirm Room 413 Allocation
            </button>
          </div>
        )}

        {/* Backend-Derived KPI Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Stock
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {summary ? summary.totalInventory : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Catalogued units</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Available
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {summary ? summary.availableUnits : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Ready for loan</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Rented Out
            </span>
            <p className="text-2xl font-black text-blue-700 mt-1">
              {summary ? summary.rentedUnits : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Active loans</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
              Maintenance
            </span>
            <p className="text-2xl font-black text-rose-700 mt-1">
              {summary ? summary.nonWorkingUnits : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Non-working</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
              Pending Requests
            </span>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {summary ? summary.pendingRequests : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Awaiting decision</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
              Total Labs
            </span>
            <p className="text-2xl font-black text-purple-700 mt-1">
              {summary ? summary.totalRooms : '—'}
            </p>
            <span className="text-[11px] text-slate-500 font-medium">Allocated rooms</span>
          </div>
        </div>

        {/* Department & Room Search Dropdown matching Reference Image 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Search Department or Lab (Reference Dropdown)
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setIsDeptDropdownOpen(true);
                }}
                onFocus={() => setIsDeptDropdownOpen(true)}
                placeholder="Search COMP, IT, AI&ML, Cyber, IoT, Room 304..."
                className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
              <button
                type="button"
                onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isDeptDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 max-h-72 overflow-y-auto">
                {filteredDepts.map((d) => (
                  <div key={d.id} className="mb-2 last:mb-0">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-[#193A71] bg-slate-50 rounded flex items-center justify-between">
                      <span>
                        {d.name} ({d.code})
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {d.rooms?.length || 0} Rooms
                      </span>
                    </div>

                    <div className="pl-3 pr-1 py-1 space-y-0.5">
                      {d.rooms && d.rooms.length > 0 ? (
                        d.rooms.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedDepartment(d);
                              setSelectedRoom(r);
                              setIsDeptDropdownOpen(false);
                            }}
                            className="w-full text-left px-2 py-1 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#193A71] rounded flex items-center justify-between transition-colors"
                          >
                            <span>
                              Room {r.roomNumber} {r.roomName ? `- ${r.roomName}` : ''}
                            </span>
                            {!r.isConfirmed && (
                              <span className="px-1 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
                                Review
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-[10px] text-slate-400 italic">
                          No confirmed rooms
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Admin Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddRoom(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-[#193A71] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Room
            </button>

            {selectedRoom && (
              <>
                <button
                  onClick={() => setShowAddEquipment(true)}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Equipment
                </button>

                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Camera className="w-4 h-4 mr-1.5 text-slate-500" />
                  Manage Photos
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'requests'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'inventory'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Room Inventory ({selectedRoom ? `Room ${selectedRoom.roomNumber}` : 'Select Room'})</span>
          </button>

          <button
            onClick={() => setActiveTab('rentals')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'rentals'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Overdue Loans</span>
          </button>

          <button
            onClick={() => setActiveTab('damage')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'damage'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Damage & Maintenance</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'departments'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Room Map</span>
          </button>
        </div>

        {/* Tab 1: Pending Requests Queue */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {pendingRequests.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3.5">Requester</th>
                      <th className="px-5 py-3.5">Equipment</th>
                      <th className="px-5 py-3.5">Room</th>
                      <th className="px-5 py-3.5">Quantity</th>
                      <th className="px-5 py-3.5">Dates</th>
                      <th className="px-5 py-3.5">Academic Purpose</th>
                      <th className="px-5 py-3.5 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {req.requesterName}
                          <span className="block font-normal text-[10px] text-slate-500">
                            {req.requesterEmail}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">
                          {req.equipmentName}
                          {req.equipmentModel && (
                            <span className="block font-mono text-[10px] text-slate-400">
                              {req.equipmentModel}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          Room {req.roomNumber} ({req.departmentCode})
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {req.requestedQuantity}
                        </td>
                        <td className="px-5 py-4 text-slate-600 text-[11px]">
                          <div>{new Date(req.startTime).toLocaleDateString()}</div>
                          <div className="text-slate-400">
                            → {new Date(req.endTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={req.purpose}>
                          {req.purpose}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingReqId(req.id)}
                              className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                            >
                              Reject
                            </button>
                          </div>

                          {/* Rejection input prompt */}
                          {rejectingReqId === req.id && (
                            <div className="mt-2 text-left bg-slate-50 p-2 rounded-lg border border-slate-200">
                              <input
                                type="text"
                                placeholder="Reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-2 py-1 text-[11px] border border-slate-300 rounded mb-1.5"
                              />
                              <div className="flex justify-end space-x-1.5">
                                <button
                                  onClick={() => setRejectingReqId(null)}
                                  className="px-2 py-0.5 text-[10px] text-slate-600"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 rounded"
                                >
                                  Confirm Reject
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No pending requests</h3>
                <p className="text-xs text-slate-400 mt-1">
                  All equipment loan applications have been processed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Room Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {selectedRoom ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Room {selectedRoom.roomNumber} Inventory
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedRoom.roomName || 'General Laboratory'} • {selectedRoom.departmentCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddEquipment(true)}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add Equipment
                  </button>
                </div>

                {roomEquipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roomEquipment.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {eq.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                eq.maintenanceStatus === 'OPERATIONAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {eq.maintenanceStatus}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">{eq.name}</h4>
                          {eq.modelNumber && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              Model: {eq.modelNumber}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Stock:</span>
                          <span className="font-bold text-slate-900">
                            {eq.availableQuantity} available / {eq.totalQuantity} total
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No equipment catalogued in this room yet. Click 'Add Equipment' above.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                Please select a room from the dropdown above.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Overdue Loans */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            {overdueRentals.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-rose-50 border-b border-rose-100 text-rose-800 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Borrower</th>
                      <th className="px-5 py-3">Equipment</th>
                      <th className="px-5 py-3">Room</th>
                      <th className="px-5 py-3">Quantity</th>
                      <th className="px-5 py-3">Due Date</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overdueRentals.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {r.borrowerName}
                          <span className="block font-normal text-[10px] text-slate-500">
                            {r.borrowerEmail}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-800">{r.equipmentName}</td>
                        <td className="px-5 py-4 text-slate-600">Room {r.roomNumber}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">{r.quantityIssued}</td>
                        <td className="px-5 py-4 font-bold text-rose-600">
                          {new Date(r.expectedReturnAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                            OVERDUE
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No overdue equipment loans</h3>
                <p className="text-xs text-slate-400 mt-1">
                  All active loans are within their scheduled return windows.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Damage & Maintenance */}
        {activeTab === 'damage' && (
          <div className="space-y-4">
            {damageReports.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Equipment</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Reporter</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {damageReports.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {d.equipmentName}
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Room {d.roomNumber}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800">
                            {d.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{d.reporterName}</td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs">{d.description}</td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select
                            value={d.status}
                            onChange={async (e) => {
                              try {
                                await damageService.updateStatus(d.id, e.target.value);
                                setActionMsg({
                                  type: 'success',
                                  text: `Report #${d.id} status updated to ${e.target.value}`,
                                });
                                loadTabContent();
                              } catch (err: unknown) {
                                const errObj = err as { message?: string };
                                setActionMsg({
                                  type: 'error',
                                  text: errObj.message || 'Status update failed',
                                });
                              }
                            }}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="INVESTIGATING">INVESTIGATING</option>
                            <option value="SENT_TO_MAINTENANCE">SENT_TO_MAINTENANCE</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No damage reports filed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Equipment is fully operational across all departments.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Department Room Allocations */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#193A71]">{dept.code}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {dept.rooms?.length || 0} Rooms
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">{dept.name}</h4>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Allocated Laboratory Rooms
                    </span>

                    {dept.rooms && dept.rooms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {dept.rooms.map((r) => (
                          <span
                            key={r.id}
                            className={`px-2 py-1 text-xs font-mono font-bold rounded-lg border ${
                              !r.isConfirmed
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            Room {r.roomNumber}
                            {!r.isConfirmed && ' ⚠️'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                        <p className="text-[11px] text-slate-400 italic">
                          No confirmed room assignments
                        </p>
                        <button
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setShowAddRoom(true);
                          }}
                          className="mt-2 text-xs font-bold text-[#193A71] hover:underline inline-flex items-center"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Allocate Room
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Institutional Seed Data</span>
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setShowAddRoom(true);
                    }}
                    className="text-xs font-semibold text-[#193A71] hover:underline"
                  >
                    + Add Lab
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <AddRoomModal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        departments={departments}
        defaultDepartmentId={selectedDepartment?.id}
        onSuccess={() => {
          departmentService.getAllDepartments().then((d) => setDepartments(d));
          dashboardService.getSummary().then((s) => setSummary(s));
          setActionMsg({ type: 'success', text: 'New room registered successfully!' });
        }}
      />

      <AddEquipmentModal
        isOpen={showAddEquipment}
        onClose={() => setShowAddEquipment(false)}
        room={selectedRoom}
        onSuccess={() => {
          loadTabContent();
          dashboardService.getSummary().then((s) => setSummary(s));
          setActionMsg({ type: 'success', text: 'Equipment added to room inventory!' });
        }}
      />

      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        room={selectedRoom}
        onSuccess={() => {
          if (selectedRoom) {
            roomService.getRoomById(selectedRoom.id).then((r) => setSelectedRoom(r));
          }
          setActionMsg({ type: 'success', text: 'Laboratory photograph uploaded to Neon storage!' });
        }}
      />
    </div>
  );
}
