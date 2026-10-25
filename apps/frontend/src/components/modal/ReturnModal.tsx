'use client';

import React, { useState, useEffect } from 'react';
import { WizardModal } from './WizardModal';
import { Equipment, Rental, ReturnCondition } from '@/types';
import { rentalService } from '@/services/rentalService';
import { CheckCircle2, AlertTriangle, AlertCircle, Wrench, ShieldCheck } from 'lucide-react';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  rental?: Rental | null;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  isOpen,
  onClose,
  equipment,
  rental: initialRental,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [rental, setRental] = useState<Rental | null>(initialRental || null);
  const [availableRentals, setAvailableRentals] = useState<Rental[]>([]);
  const [returnCondition, setReturnCondition] = useState<ReturnCondition>('WORKING');
  const [notes, setNotes] = useState('');
  const [isLoadingRentals, setIsLoadingRentals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRental) {
      setRental(initialRental);
    } else if (isOpen && equipment) {
      // Find active rentals for this equipment
      setIsLoadingRentals(true);
      rentalService
        .getMyRentals()
        .then((rentals) => {
          const matching = rentals.filter(
            (r) => r.equipmentId === equipment.id && r.status === 'ACTIVE'
          );
          setAvailableRentals(matching);
          if (matching.length > 0) {
            setRental(matching[0]);
          } else {
            // Also check all rentals if user is admin
            rentalService.getAllRentals('ACTIVE').then((allActive) => {
              const adminMatching = allActive.filter((r) => r.equipmentId === equipment.id);
              setAvailableRentals(adminMatching);
              if (adminMatching.length > 0) setRental(adminMatching[0]);
            }).catch(() => {});
          }
        })
        .catch((e) => setError(e.message))
        .finally(() => setIsLoadingRentals(false));
    }
  }, [isOpen, equipment, initialRental]);

  if (!equipment && !rental) return null;

  const steps = [
    { title: 'Equipment Inspection', description: 'Record physical & electrical condition' },
    { title: 'Check-in Signoff', description: 'Confirm return to lab inventory' },
  ];

  const handleNext = () => {
    setError(null);
    if (!rental) {
      setError('No active rental record selected to process return.');
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!rental) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await rentalService.recordReturn(rental.id, {
        returnCondition,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
      setCurrentStep(1);
      setNotes('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to process return. Please contact lab admin.');
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
      title="Check-in & Return Equipment"
      subtitle={equipment ? `${equipment.name} • Room ${equipment.roomNumber}` : 'TCET Lab Lending'}
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Complete Return"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Inspection & Condition */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Active Rental Selection if multiple */}
          {availableRentals.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Active Rental Loan
              </label>
              <select
                value={rental?.id || ''}
                onChange={(e) => {
                  const sel = availableRentals.find((r) => r.id === Number(e.target.value));
                  if (sel) setRental(sel);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              >
                {availableRentals.map((r) => (
                  <option key={r.id} value={r.id}>
                    Loan #{r.id} - {r.borrowerName} ({r.quantityIssued} Unit) - Due{' '}
                    {new Date(r.expectedReturnAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {rental && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-semibold text-slate-900">{rental.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issued On:</span>
                <span className="text-slate-700">
                  {new Date(rental.issuedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Due Date:</span>
                <span
                  className={`font-semibold ${
                    rental.isOverdue ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {new Date(rental.expectedReturnAt).toLocaleDateString()}
                  {rental.isOverdue && ' (OVERDUE)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity Issued:</span>
                <span className="font-semibold text-slate-900">
                  {rental.quantityIssued} Unit(s)
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Physical & Functional Condition Upon Return
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setReturnCondition('WORKING')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  returnCondition === 'WORKING'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 mb-2 ${
                    returnCondition === 'WORKING' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Working</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Fully operational</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReturnCondition('DAMAGED')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  returnCondition === 'DAMAGED'
                    ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 mb-2 ${
                    returnCondition === 'DAMAGED' ? 'text-rose-600' : 'text-slate-400'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Damaged</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Broken or burned</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setReturnCondition('REQUIRES_MAINTENANCE')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  returnCondition === 'REQUIRES_MAINTENANCE'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Wrench
                  className={`w-5 h-5 mb-2 ${
                    returnCondition === 'REQUIRES_MAINTENANCE'
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">Needs Care</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Calibration / test</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Notes / Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cables wrapped, probes included, power supply tested OK..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {currentStep === 2 && rental && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Return Verification Summary
            </h4>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Equipment:</span>
              <span className="font-semibold text-slate-900">{rental.equipmentName}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Borrower:</span>
              <span className="font-semibold text-slate-900">{rental.borrowerName}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200">
              <span className="text-slate-500">Recorded Condition:</span>
              <span
                className={`font-bold ${
                  returnCondition === 'WORKING'
                    ? 'text-emerald-700'
                    : returnCondition === 'DAMAGED'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {returnCondition}
              </span>
            </div>
            {notes && (
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">Remarks:</span>
                <span className="text-slate-800 italic">{notes}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Inventory Restoration:</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Confirming this check-in will immediately release {rental.quantityIssued} unit(s)
                back to active laboratory stock and mark this loan record as returned.
              </p>
            </div>
          </div>
        </div>
      )}
    </WizardModal>
  );
};
