'use client';

import React, { useState, useEffect } from 'react';
import { WizardModal } from './WizardModal';
import { Equipment } from '@/types';
import { requestService } from '@/services/requestService';
import { Layers, Calendar, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  onSuccess: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  equipment,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime) {
      setStartTime(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
    }
    if (!endTime) {
      setEndTime(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    }
  }, [startTime, endTime]);

  if (!equipment) return null;

  const steps = [
    { title: 'Specifications', description: 'Review equipment & live stock' },
    { title: 'Loan Period', description: 'Specify dates & academic purpose' },
    { title: 'Confirmation', description: 'Review & submit loan request' },
  ];

  const handleNext = () => {
    setError(null);
    if (currentStep === 2) {
      if (!purpose.trim()) {
        setError('Please describe the academic or project purpose for this loan.');
        return;
      }
      if (new Date(startTime) >= new Date(endTime)) {
        setError('Return time must be scheduled after start time.');
        return;
      }
      if (quantity < 1 || quantity > equipment.availableQuantity) {
        setError(`Quantity must be between 1 and ${equipment.availableQuantity}.`);
        return;
      }
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

      await requestService.createRequest({
        equipmentId: equipment.id,
        requestedQuantity: quantity,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        purpose: purpose.trim(),
      });

      onSuccess();
      onClose();
      // Reset state
      setCurrentStep(1);
      setPurpose('');
      setQuantity(1);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to submit loan request. Please check availability.');
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
      title="Request Laboratory Equipment"
      subtitle={`Room ${equipment.roomNumber} • ${equipment.departmentCode}`}
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Submit Loan Request"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Specs & Stock Verification */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 text-slate-700 mb-1.5">
              {equipment.category}
            </span>
            <h3 className="text-base font-bold text-slate-900">{equipment.name}</h3>
            {equipment.modelNumber && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Model: {equipment.modelNumber}
              </p>
            )}
            {equipment.description && (
              <p className="text-xs text-slate-600 mt-2">{equipment.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-3">
              <Layers className="w-5 h-5 text-[#193A71]" />
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Available Stock</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {equipment.availableQuantity} of {equipment.totalQuantity} Units
                </p>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Condition</p>
                <p className="text-sm font-extrabold text-emerald-700 capitalize">
                  {equipment.condition.toLowerCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
            <p className="font-semibold mb-1">Institutional Lending Guidelines:</p>
            <ul className="list-disc pl-4 space-y-1 text-blue-800 text-[11px]">
              <li>Equipment can only be loaned to verified TCET students and faculty.</li>
              <li>Approval is required from the department laboratory administrator.</li>
              <li>Late returns or damaged goods must be reported immediately.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Loan Period & Purpose */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity Requested
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min={1}
                max={equipment.availableQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
              <span className="text-xs text-slate-500">
                Max available: {equipment.availableQuantity} units
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Return Date & Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Purpose / Experiment Description
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Practicals for Semester VI Microprocessor Lab or Capstone Project experiment..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>
        </div>
      )}

      {/* Step 3: Confirmation & Agreement */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Loan Request Summary
            </h4>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Equipment:</span>
              <span className="font-semibold text-slate-900">{equipment.name}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Room:</span>
              <span className="font-semibold text-slate-900">
                Room {equipment.roomNumber} ({equipment.departmentCode})
              </span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Quantity:</span>
              <span className="font-semibold text-slate-900">{quantity} Unit(s)</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Period:</span>
              <span className="font-semibold text-slate-900">
                {new Date(startTime).toLocaleString()} → {new Date(endTime).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500">Purpose:</span>
              <span className="font-medium text-slate-800 italic max-w-[260px] text-right truncate">
                {purpose}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
            <p className="font-semibold">Declaration of Responsibility:</p>
            <p className="text-[11px] mt-0.5 text-amber-800">
              By submitting this request, you agree to handle laboratory equipment safely in
              accordance with TCET academic policies and return it in working condition by the
              due date.
            </p>
          </div>
        </div>
      )}
    </WizardModal>
  );
};
