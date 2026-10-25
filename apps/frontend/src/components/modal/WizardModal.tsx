'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface WizardStep {
  title: string;
  description?: string;
}

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  steps?: WizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  canNext?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  steps,
  currentStep = 1,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
  canNext = true,
  submitLabel = 'Confirm & Submit',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSteps = steps ? steps.length : 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 tcet-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[620px] flex flex-col overflow-hidden border border-slate-200 animate-fade-in">
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (if multi-step) */}
        {steps && steps.length > 1 && (
          <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
            {steps.map((step, idx) => {
              const stepNumber = idx + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isCompleted
                          ? 'bg-[#193A71] text-white'
                          : isCurrent
                          ? 'bg-[#E6771C] text-white ring-4 ring-amber-100'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 mx-3 h-0.5 bg-slate-200" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            {currentStep > 1 && onPrev && (
              <button
                type="button"
                onClick={onPrev}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {!isLastStep && onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext || isSubmitting}
                className="inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-[#193A71] hover:bg-[#0F2752] rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}

            {isLastStep && onSubmit && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={!canNext || isSubmitting}
                className="inline-flex items-center px-5 py-2 text-xs font-semibold text-white bg-[#E6771C] hover:bg-[#D46914] rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
