'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Plus,
  Clock,
  Package,
  RotateCcw,
  Shield,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  Building2,
  Camera,
} from 'lucide-react';
import { Department, Room, User } from '@/types';

interface SidebarProps {
  user: User | null;
  departments: Department[];
  selectedDepartment: Department | null;
  selectedRoom: Room | null;
  onSelectDepartment: (dept: Department) => void;
  onSelectRoom: (room: Room) => void;
  onOpenAddRoom?: () => void;
  onOpenPhotoManager?: () => void;
  currentTab: 'kanban' | 'requests' | 'rentals' | 'returns' | 'admin' | 'photos';
  onTabChange: (tab: 'kanban' | 'requests' | 'rentals' | 'returns' | 'admin' | 'photos') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  departments,
  selectedDepartment,
  selectedRoom,
  onSelectDepartment,
  onSelectRoom,
  onOpenAddRoom,
  onOpenPhotoManager,
  currentTab,
  onTabChange,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({
    [selectedDepartment?.code || 'COMP']: true,
  });

  const toggleDept = (code: string) => {
    setExpandedDepts((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside
      className={`bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
            <Image
              src="/images/logo.png"
              alt="TCET Logo"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="block font-bold text-sm text-[#193A71] tracking-tight truncate">
                TCET Labs
              </span>
              <span className="block text-[10px] text-slate-500 font-medium truncate">
                Thakur College Mumbai
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Identity Profile Card */}
      {!collapsed && user && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#193A71] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              <span
                className={`inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded ${
                  isAdmin
                    ? 'bg-purple-100 text-purple-700'
                    : user.role === 'FACULTY'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {user.role} {user.studyingYear ? `• ${user.studyingYear}` : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Tabs */}
      <div className="p-3 border-b border-slate-100 space-y-1">
        <button
          onClick={() => onTabChange('kanban')}
          className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            currentTab === 'kanban'
              ? 'bg-[#193A71] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Equipment Kanban"
        >
          <Layers className="w-4 h-4 mr-2.5 shrink-0" />
          {!collapsed && <span>Equipment Kanban</span>}
        </button>

        <button
          onClick={() => onTabChange('requests')}
          className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            currentTab === 'requests'
              ? 'bg-[#193A71] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="My Requests"
        >
          <Clock className="w-4 h-4 mr-2.5 shrink-0" />
          {!collapsed && <span>My Requests</span>}
        </button>

        <button
          onClick={() => onTabChange('rentals')}
          className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            currentTab === 'rentals'
              ? 'bg-[#193A71] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="My Rentals"
        >
          <Package className="w-4 h-4 mr-2.5 shrink-0" />
          {!collapsed && <span>My Active Rentals</span>}
        </button>

        <button
          onClick={() => onTabChange('returns')}
          className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
            currentTab === 'returns'
              ? 'bg-[#193A71] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Return History"
        >
          <RotateCcw className="w-4 h-4 mr-2.5 shrink-0" />
          {!collapsed && <span>Return History</span>}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => onTabChange('admin')}
              className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                currentTab === 'admin'
                  ? 'bg-[#E6771C] text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
              title="Admin Overview"
            >
              <Shield className="w-4 h-4 mr-2.5 shrink-0" />
              {!collapsed && <span>Admin Management</span>}
            </button>

            {onOpenPhotoManager && (
              <button
                onClick={() => onTabChange('photos')}
                className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  currentTab === 'photos'
                    ? 'bg-[#193A71] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Laboratory Photos"
              >
                <Camera className="w-4 h-4 mr-2.5 shrink-0" />
                {!collapsed && <span>Laboratory Photos</span>}
              </button>
            )}
          </>
        )}
      </div>

      {/* Departments & Rooms Accordion List */}
      <div className="flex-1 overflow-y-auto p-3">
        {!collapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Departments & Labs
            </span>
            {isAdmin && onOpenAddRoom && (
              <button
                onClick={onOpenAddRoom}
                className="text-[11px] font-semibold text-[#193A71] hover:text-[#0F2752] flex items-center"
                title="Add new room"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                Add Room
              </button>
            )}
          </div>
        )}

        <div className="space-y-1">
          {departments.map((dept) => {
            const isExpanded = !!expandedDepts[dept.code];
            const isDeptActive = selectedDepartment?.id === dept.id;

            return (
              <div key={dept.id} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => {
                    toggleDept(dept.code);
                    onSelectDepartment(dept);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                    isDeptActive
                      ? 'bg-slate-100/90 font-bold text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    {!collapsed && (
                      <span className="text-xs truncate">{dept.code}</span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-full">
                        {dept.rooms?.length || 0}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  )}
                </button>

                {/* Rooms List underneath Department */}
                {!collapsed && isExpanded && (
                  <div className="pl-6 pr-2 py-1 space-y-0.5">
                    {dept.rooms && dept.rooms.length > 0 ? (
                      dept.rooms.map((room) => {
                        const isRoomSelected = selectedRoom?.id === room.id;
                        return (
                          <button
                            key={room.id}
                            onClick={() => {
                              onSelectDepartment(dept);
                              onSelectRoom(room);
                              onTabChange('kanban');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              isRoomSelected
                                ? 'bg-[#193A71]/10 text-[#193A71] font-bold border border-[#193A71]/20'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">
                              Room {room.roomNumber}
                              {room.roomName ? ` - ${room.roomName}` : ''}
                            </span>
                            {!room.isConfirmed && (
                              <span
                                className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded ml-1 shrink-0"
                                title="Needs admin confirmation"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                Review
                              </span>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-1.5 px-2 text-[11px] text-slate-400 italic flex items-center justify-between">
                        <span>No confirmed labs</span>
                        {isAdmin && onOpenAddRoom && (
                          <button
                            onClick={onOpenAddRoom}
                            className="text-[10px] font-semibold text-[#193A71] underline"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Action Footer */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4 mr-2.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
