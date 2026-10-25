'use client';

import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Wrench,
  Camera,
} from 'lucide-react';
import { Equipment, KanbanData, Room, User } from '@/types';

interface KanbanBoardProps {
  room: Room | null;
  kanbanData: KanbanData;
  isLoading: boolean;
  user: User | null;
  onRequestEquipment: (equipment: Equipment) => void;
  onReturnEquipment: (equipment: Equipment) => void;
  onReportDamage: (equipment: Equipment) => void;
  onOpenAddEquipment?: () => void;
  onOpenPhotos?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  room,
  kanbanData,
  isLoading,
  user,
  onRequestEquipment,
  onReturnEquipment,
  onReportDamage,
  onOpenAddEquipment,
  onOpenPhotos,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filterList = (items: Equipment[] = []) => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.modelNumber && item.modelNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const workingList = filterList(kanbanData.working);
  const rentedList = filterList(kanbanData.rentedOut);
  const notWorkingList = filterList(kanbanData.notWorking);

  const categories = Array.from(
    new Set([
      ...(kanbanData.working || []).map((e) => e.category),
      ...(kanbanData.rentedOut || []).map((e) => e.category),
      ...(kanbanData.notWorking || []).map((e) => e.category),
    ])
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Room Header & Toolbar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#193A71]/10 text-[#193A71]">
                {room ? room.departmentCode : 'TCET'}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {room ? `Room ${room.roomNumber}` : 'All Laboratory Equipment'}
              </h1>
              {room && !room.isConfirmed && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  ⚠️ Administrative Confirmation Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {room?.roomName
                ? `${room.roomName} • ${room.labType || 'General Lab'}`
                : 'Live equipment inventory availability and lending tracker'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {room && onOpenPhotos && (
              <button
                onClick={onOpenPhotos}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Camera className="w-4 h-4 mr-1.5 text-slate-600" />
                Lab Photos {room.photoCount ? `(${room.photoCount})` : ''}
              </button>
            )}

            {user?.role === 'ADMIN' && onOpenAddEquipment && (
              <button
                onClick={onOpenAddEquipment}
                className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-xl transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Equipment
              </button>
            )}
          </div>
        </div>

        {/* Search & Category Filter Bar matching attached reference 2 */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment by name, model, or category..."
              className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71] transition-all"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#193A71] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3-Column Kanban Board Grid */}
      <div className="flex-1 overflow-x-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[900px] h-full items-start">
          {/* Column 1: Working */}
          <div className="bg-slate-100/70 rounded-2xl p-4 flex flex-col max-h-full border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-sm font-bold text-slate-800">Working</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                {workingList.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <SkeletonCard />
              ) : workingList.length > 0 ? (
                workingList.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    column="working"
                    onAction={() => onRequestEquipment(eq)}
                    actionLabel="Request Loan"
                  />
                ))
              ) : (
                <EmptyColumnPlaceholder text="No available equipment in this room." />
              )}
            </div>
          </div>

          {/* Column 2: Rented Out */}
          <div className="bg-slate-100/70 rounded-2xl p-4 flex flex-col max-h-full border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-slate-800">Rented Out</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                {rentedList.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <SkeletonCard />
              ) : rentedList.length > 0 ? (
                rentedList.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    column="rented"
                    onAction={() => onReturnEquipment(eq)}
                    actionLabel="Check-in / Return"
                  />
                ))
              ) : (
                <EmptyColumnPlaceholder text="No equipment currently on loan." />
              )}
            </div>
          </div>

          {/* Column 3: Not Working */}
          <div className="bg-slate-100/70 rounded-2xl p-4 flex flex-col max-h-full border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="text-sm font-bold text-slate-800">Not Working</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800">
                {notWorkingList.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading ? (
                <SkeletonCard />
              ) : notWorkingList.length > 0 ? (
                notWorkingList.map((eq) => (
                  <EquipmentCard
                    key={eq.id}
                    equipment={eq}
                    column="not_working"
                    onAction={() => onReportDamage(eq)}
                    actionLabel="View / Report Issue"
                  />
                ))
              ) : (
                <EmptyColumnPlaceholder text="All equipment is operational." />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EquipmentCardProps {
  equipment: Equipment;
  column: 'working' | 'rented' | 'not_working';
  onAction: () => void;
  actionLabel: string;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  column,
  onAction,
  actionLabel,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 mb-1">
            {equipment.category}
          </span>
          <h4 className="text-xs font-bold text-slate-900 leading-snug">
            {equipment.name}
          </h4>
          {equipment.modelNumber && (
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Model: {equipment.modelNumber}
            </p>
          )}
        </div>

        <span
          className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full ${
            column === 'working'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : column === 'rented'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {column === 'working' ? 'Ready' : column === 'rented' ? 'Issued' : 'Maintenance'}
        </span>
      </div>

      {equipment.description && (
        <p className="text-[11px] text-slate-600 line-clamp-2 mt-2">
          {equipment.description}
        </p>
      )}

      {/* Stock & Availability Info */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center text-slate-600">
          <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>
            <strong className="text-slate-900 font-bold">
              {equipment.availableQuantity}
            </strong>
            /{equipment.totalQuantity} Units
          </span>
        </div>

        {equipment.expectedReturnDate && column === 'rented' && (
          <div className="flex items-center text-blue-600 font-medium">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span>
              Due: {new Date(equipment.expectedReturnDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
          column === 'working'
            ? 'bg-[#193A71] hover:bg-[#0F2752] text-white'
            : column === 'rented'
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-slate-800 hover:bg-slate-900 text-white'
        }`}
      >
        <span>{actionLabel}</span>
        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
      </button>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-3">
    <div className="h-4 bg-slate-200 rounded w-1/3" />
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-8 bg-slate-100 rounded w-full" />
  </div>
);

const EmptyColumnPlaceholder: React.FC<{ text: string }> = ({ text }) => (
  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-200 rounded-xl">
    <CheckCircle2 className="w-6 h-6 text-slate-300 mb-1" />
    <p className="text-xs text-slate-400 font-medium">{text}</p>
  </div>
);
