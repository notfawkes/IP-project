'use client';

import React, { useState } from 'react';
import { WizardModal } from './WizardModal';
import { Equipment, DamageCategory } from '@/types';
import { damageService } from '@/services/damageService';
import { AlertTriangle, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSuccess: () => void;
}

export const DamageReportModal: React.FC<DamageReportModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<DamageCategory>('MALFUNCTION');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!equipment) return null;

  const steps = [
    { title: 'Incident Classification', description: 'Select damage category & symptoms' },
    { title: 'Report Confirmation', description: 'Review details & dispatch to admin' },
  ];

  const handleNext = () => {
    setError(null);
    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description (at least 10 characters).');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      await damageService.createReport({
        equipmentId: equipment.id,
        category,
        description: description.trim(),
        photoUrl: photoUrl.trim() || undefined,
      });

      onSuccess();
      onClose();
      setCurrentStep(1);
      setDescription('');
      setPhotoUrl('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to submit damage report. Please notify laboratory staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={() => {
        setError(null);
        setCurrentStep(1);
        onClose();
      }}
      title="Report Equipment Damage or Malfunction"
      subtitle={`${equipment.name} • Room ${equipment.roomNumber}`}
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="File Damage Report"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Classification */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Affected Equipment
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{equipment.name}</h4>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Category: {equipment.category} {equipment.modelNumber ? `• Model: ${equipment.modelNumber}` : ''}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Damage Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { id: 'PHYSICAL', label: 'Physical Damage', desc: 'Cracked case, bent pin, dropped' },
                  { id: 'ELECTRICAL', label: 'Electrical Fault', desc: 'Short circuit, burnt smell, power failure' },
                  { id: 'MALFUNCTION', label: 'Functional Glitch', desc: 'Calibration error, bad reading' },
                  { id: 'MISSING_PARTS', label: 'Missing Parts', desc: 'Probe, adapter, cable missing' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? 'border-[#193A71] bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900">{cat.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description of Damage / Observation *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain how the issue occurred or current symptoms observed..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting Photo URL (Optional)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Damage Report Summary
            </h4>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Equipment:</span>
              <span className="font-semibold text-slate-900">{equipment.name}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Category:</span>
              <span className="font-bold text-rose-600">{category}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Description:</span>
              <span className="text-slate-800 font-medium max-w-[280px] text-right">
                {description}
              </span>
            </div>
            {photoUrl && (
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Photo URL:</span>
                <span className="text-blue-600 font-mono text-[11px] truncate max-w-[280px]">
                  {photoUrl}
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Maintenance Notification:</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Filing this report will notify lab technicians and move this equipment item
                into the 'Not Working' maintenance queue for inspection.
              </p>
            </div>
          </div>
        </div>
      )}
    </WizardModal>
  );
};
