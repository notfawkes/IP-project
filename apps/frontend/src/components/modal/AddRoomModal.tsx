'use client';

import React, { useState } from 'react';
import { WizardModal } from './WizardModal';
import { Department } from '@/types';
import { departmentService } from '@/services/departmentService';
import { AlertCircle, PlusCircle } from 'lucide-react';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  defaultDepartmentId?: number;
  onSuccess: () => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  departments,
  defaultDepartmentId,
  onSuccess,
}) => {
  const [departmentId, setDepartmentId] = useState<number>(
    defaultDepartmentId || (departments[0]?.id ?? 1)
  );
  const [roomNumber, setRoomNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [labType, setLabType] = useState('Hardware / Systems Lab');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!roomNumber.trim()) {
      setError('Please enter a valid room number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await departmentService.addRoom(departmentId, {
        roomNumber: roomNumber.trim(),
        roomName: roomName.trim() || undefined,
        labType: labType.trim() || undefined,
        isConfirmed: true,
      });

      onSuccess();
      onClose();
      setRoomNumber('');
      setRoomName('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to create room. Room may already exist in this department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={() => {
        setError(null);
        onClose();
      }}
      title="Add New Laboratory Room"
      subtitle="Authorized Administrator Workflow"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Register Room"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Department *
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Room Number *
          </label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="e.g. 401, 318, 520"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Laboratory Title / Name
          </label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g. Microprocessor & IoT Lab"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Laboratory Classification
          </label>
          <select
            value={labType}
            onChange={(e) => setLabType(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
          >
            <option value="Hardware / Systems Lab">Hardware / Systems Lab</option>
            <option value="Computing & AI Lab">Computing & AI Lab</option>
            <option value="Electronics & Instrumentation Lab">Electronics & Instrumentation Lab</option>
            <option value="Network & Security Lab">Network & Security Lab</option>
            <option value="Mechanical / Materials Lab">Mechanical / Materials Lab</option>
            <option value="First Year Engineering Lab">First Year Engineering Lab</option>
          </select>
        </div>

        <div className="p-3 bg-blue-50/80 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
          <PlusCircle className="w-4 h-4 text-[#193A71] shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800">
            Adding a room registers it in the institutional database and allows administrators
            to upload laboratory photos and catalogue equipment.
          </p>
        </div>
      </div>
    </WizardModal>
  );
};
