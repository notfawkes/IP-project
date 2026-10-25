'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { RequestModal } from '@/components/modal/RequestModal';
import { ReturnModal } from '@/components/modal/ReturnModal';
import { DamageReportModal } from '@/components/modal/DamageReportModal';
import { AddEquipmentModal } from '@/components/modal/AddEquipmentModal';
import { AddRoomModal } from '@/components/modal/AddRoomModal';
import { PhotoUploadModal } from '@/components/photo/PhotoUploadModal';
import { authService } from '@/services/authService';
import { departmentService } from '@/services/departmentService';
import { roomService } from '@/services/roomService';
import { requestService } from '@/services/requestService';
import { rentalService } from '@/services/rentalService';
import {
  Department,
  Room,
  Equipment,
  KanbanData,
  User,
  RentalRequest,
  Rental,
  ReturnRecord,
} from '@/types';
import {
  Clock,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Active Tab: kanban, requests, rentals, returns
  const [currentTab, setCurrentTab] = useState<
    'kanban' | 'requests' | 'rentals' | 'returns' | 'admin' | 'photos'
  >('kanban');

  // Kanban Data & Loading
  const [kanbanData, setKanbanData] = useState<KanbanData>({
    working: [],
    rentedOut: [],
    notWorking: [],
  });
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  // Requests, Rentals, Returns state
  const [myRequests, setMyRequests] = useState<RentalRequest[]>([]);
  const [myRentals, setMyRentals] = useState<Rental[]>([]);
  const [myReturns, setMyReturns] = useState<ReturnRecord[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'request' | 'return' | 'damage' | 'addEquipment' | 'addRoom' | 'photos' | null
  >(null);
  const [targetEquipment, setTargetEquipment] = useState<Equipment | null>(null);
  const [targetRental, setTargetRental] = useState<Rental | null>(null);

  // Load User & Departments on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    departmentService
      .getAllDepartments()
      .then((depts) => {
        setDepartments(depts);
        if (depts.length > 0) {
          // Default to user's department if available
          const userDept = currentUser.departmentCode
            ? depts.find((d) => d.code === currentUser.departmentCode) || depts[0]
            : depts[0];

          setSelectedDepartment(userDept);

          // Default to first room with confirmed equipment
          if (userDept.rooms && userDept.rooms.length > 0) {
            setSelectedRoom(userDept.rooms[0]);
          } else {
            // Find first department with rooms
            const withRooms = depts.find((d) => d.rooms && d.rooms.length > 0);
            if (withRooms && withRooms.rooms.length > 0) {
              setSelectedDepartment(withRooms);
              setSelectedRoom(withRooms.rooms[0]);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load departments', err));
  }, [router]);

  // Load Equipment for Selected Room
  const loadRoomEquipment = useCallback(async (roomId: number) => {
    setIsLoadingEquipment(true);
    try {
      const items = await roomService.getRoomEquipment(roomId);

      const working: Equipment[] = [];
      const rentedOut: Equipment[] = [];
      const notWorking: Equipment[] = [];

      items.forEach((item) => {
        if (item.maintenanceStatus !== 'OPERATIONAL' || item.condition === 'DAMAGED') {
          notWorking.push(item);
        } else {
          if (item.availableQuantity > 0) {
            working.push(item);
          }
          if (item.rentedQuantity > 0) {
            rentedOut.push(item);
          }
        }
      });

      setKanbanData({ working, rentedOut, notWorking });
    } catch (err) {
      console.error('Failed to load equipment', err);
      setKanbanData({ working: [], rentedOut: [], notWorking: [] });
    } finally {
      setIsLoadingEquipment(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      loadRoomEquipment(selectedRoom.id);
    }
  }, [selectedRoom, loadRoomEquipment]);

  // Load Tab Data when switched
  const loadTabData = useCallback(async () => {
    setIsLoadingLists(true);
    try {
      if (currentTab === 'requests') {
        const reqs = await requestService.getMyRequests();
        setMyRequests(reqs);
      } else if (currentTab === 'rentals') {
        const rents = await rentalService.getMyRentals();
        setMyRentals(rents);
      } else if (currentTab === 'returns') {
        const rets = await rentalService.getMyReturns();
        setMyReturns(rets);
      }
    } catch (err) {
      console.error('Failed to fetch tab data', err);
    } finally {
      setIsLoadingLists(false);
    }
  }, [currentTab]);

  useEffect(() => {
    if (currentTab !== 'kanban' && currentTab !== 'admin' && currentTab !== 'photos') {
      loadTabData();
    }
  }, [currentTab, loadTabData]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Persistent Sidebar */}
      <Sidebar
        user={user}
        departments={departments}
        selectedDepartment={selectedDepartment}
        selectedRoom={selectedRoom}
        onSelectDepartment={(dept) => {
          setSelectedDepartment(dept);
          if (dept.rooms && dept.rooms.length > 0) {
            setSelectedRoom(dept.rooms[0]);
          } else {
            setSelectedRoom(null);
            setKanbanData({ working: [], rentedOut: [], notWorking: [] });
          }
        }}
        onSelectRoom={(room) => setSelectedRoom(room)}
        onOpenAddRoom={() => setActiveModal('addRoom')}
        onOpenPhotoManager={() => setActiveModal('photos')}
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            router.push('/admin');
          } else if (tab === 'photos') {
            setActiveModal('photos');
          } else {
            setCurrentTab(tab);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* TAB 1: Kanban Board */}
        {currentTab === 'kanban' && (
          <KanbanBoard
            room={selectedRoom}
            kanbanData={kanbanData}
            isLoading={isLoadingEquipment}
            user={user}
            onRequestEquipment={(eq) => {
              setTargetEquipment(eq);
              setActiveModal('request');
            }}
            onReturnEquipment={(eq) => {
              setTargetEquipment(eq);
              setTargetRental(null);
              setActiveModal('return');
            }}
            onReportDamage={(eq) => {
              setTargetEquipment(eq);
              setActiveModal('damage');
            }}
            onOpenAddEquipment={() => setActiveModal('addEquipment')}
            onOpenPhotos={() => setActiveModal('photos')}
          />
        )}

        {/* TAB 2: My Requests */}
        {currentTab === 'requests' && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Equipment Loan Requests
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track pending approvals, active authorizations, and review reasons for rejected loans.
              </p>
            </div>

            {isLoadingLists ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading requests...</div>
            ) : myRequests.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Equipment</th>
                      <th className="px-5 py-3">Room</th>
                      <th className="px-5 py-3">Units</th>
                      <th className="px-5 py-3">Scheduled Period</th>
                      <th className="px-5 py-3">Purpose</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {req.equipmentName}
                          {req.equipmentModel && (
                            <span className="block font-mono font-normal text-[10px] text-slate-500">
                              {req.equipmentModel}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          Room {req.roomNumber} ({req.departmentCode})
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          {req.requestedQuantity}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <div>{new Date(req.startTime).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-400">
                            → {new Date(req.endTime).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={req.purpose}>
                          {req.purpose}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No loan requests submitted</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Navigate to the Equipment Kanban and request items for your practicals.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Active Rentals */}
        {currentTab === 'rentals' && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Active Equipment Loans
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Equipment currently in your possession. Return on time to maintain laboratory eligibility.
              </p>
            </div>

            {isLoadingLists ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading rentals...</div>
            ) : myRentals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700">
                          Room {rental.roomNumber} ({rental.departmentCode})
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            rental.isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {rental.isOverdue ? 'OVERDUE' : 'ACTIVE'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{rental.equipmentName}</h3>
                      {rental.equipmentModel && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Model: {rental.equipmentModel}
                        </p>
                      )}

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Issued Quantity:</span>
                          <span className="font-bold text-slate-900">{rental.quantityIssued} Unit(s)</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Issued On:</span>
                          <span>{new Date(rental.issuedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Return Due Date:</span>
                          <span className={`font-bold ${rental.isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                            {new Date(rental.expectedReturnAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTargetRental(rental);
                          setTargetEquipment(null);
                          setActiveModal('return');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] transition-colors flex items-center justify-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Return Loan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No active equipment loans</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You do not currently have any equipment checked out.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Return History */}
        {currentTab === 'returns' && (
          <div className="flex-1 flex flex-col p-8 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Equipment Return History
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Audited check-in logs and condition verification reports.
              </p>
            </div>

            {isLoadingLists ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading returns...</div>
            ) : myReturns.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="px-5 py-3">Equipment</th>
                      <th className="px-5 py-3">Borrower</th>
                      <th className="px-5 py-3">Returned At</th>
                      <th className="px-5 py-3">Condition</th>
                      <th className="px-5 py-3">Inspected By</th>
                      <th className="px-5 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myReturns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{ret.equipmentName}</td>
                        <td className="px-5 py-4 text-slate-600">{ret.borrowerName}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {new Date(ret.returnedAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold rounded-full ${
                              ret.returnCondition === 'WORKING'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ret.returnCondition === 'DAMAGED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ret.returnCondition}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{ret.recordedByName}</td>
                        <td className="px-5 py-4 text-slate-500 italic">
                          {ret.notes || 'No remarks recorded.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">No return records found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Completed equipment loans will be archived here.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Workflows */}
      <RequestModal
        isOpen={activeModal === 'request'}
        onClose={() => setActiveModal(null)}
        equipment={targetEquipment}
        onSuccess={() => {
          if (selectedRoom) loadRoomEquipment(selectedRoom.id);
          setCurrentTab('requests');
        }}
      />

      <ReturnModal
        isOpen={activeModal === 'return'}
        onClose={() => setActiveModal(null)}
        equipment={targetEquipment}
        rental={targetRental}
        onSuccess={() => {
          if (selectedRoom) loadRoomEquipment(selectedRoom.id);
          loadTabData();
        }}
      />

      <DamageReportModal
        isOpen={activeModal === 'damage'}
        onClose={() => setActiveModal(null)}
        equipment={targetEquipment}
        onSuccess={() => {
          if (selectedRoom) loadRoomEquipment(selectedRoom.id);
        }}
      />

      <AddEquipmentModal
        isOpen={activeModal === 'addEquipment'}
        onClose={() => setActiveModal(null)}
        room={selectedRoom}
        onSuccess={() => {
          if (selectedRoom) loadRoomEquipment(selectedRoom.id);
        }}
      />

      <AddRoomModal
        isOpen={activeModal === 'addRoom'}
        onClose={() => setActiveModal(null)}
        departments={departments}
        defaultDepartmentId={selectedDepartment?.id}
        onSuccess={() => {
          departmentService.getAllDepartments().then((depts) => setDepartments(depts));
        }}
      />

      <PhotoUploadModal
        isOpen={activeModal === 'photos'}
        onClose={() => setActiveModal(null)}
        room={selectedRoom}
        onSuccess={() => {
          if (selectedRoom) {
            // refresh room info
            roomService.getRoomById(selectedRoom.id).then((r) => setSelectedRoom(r));
          }
        }}
      />
    </div>
  );
}
