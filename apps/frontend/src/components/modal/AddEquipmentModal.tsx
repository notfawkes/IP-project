'use client';

import React, { useState } from 'react';
import { WizardModal } from './WizardModal';
import { Room } from '@/types';
import { equipmentService } from '@/services/equipmentService';
import { AlertCircle, Layers, Cpu } from 'lucide-react';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onSuccess: () => void;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  room,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Microcontroller & Embedded');
  const [modelNumber, setModelNumber] = useState('');
  const [description, setDescription] = useState('');
  const [totalQuantity, setTotalQuantity] = useState(5);
  const [trackingMode, setTrackingMode] = useState<'QUANTITY' | 'INDIVIDUAL'>('QUANTITY');
  const [condition, setCondition] = useState('EXCELLENT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!room) return null;

  const steps = [
    { title: 'Equipment Details', description: 'Name, model & classification' },
    { title: 'Stock & Tracking', description: 'Quantity & tracking mode' },
  ];

  const handleNext = () => {
    setError(null);
    if (!name.trim()) {
      setError('Please provide the equipment name.');
      return;
    }
    if (!category.trim()) {
      setError('Please provide a category.');
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

      await equipmentService.createEquipment(room.id, {
        name: name.trim(),
        category: category.trim(),
        modelNumber: modelNumber.trim() || undefined,
        description: description.trim() || undefined,
        departmentId: room.departmentId,
        trackingMode,
        totalQuantity,
        condition,
        maintenanceStatus: 'OPERATIONAL',
      });

      onSuccess();
      onClose();
      setCurrentStep(1);
      setName('');
      setModelNumber('');
      setDescription('');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to add equipment to room inventory.');
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
      title="Add Equipment to Laboratory"
      subtitle={`Room ${room.roomNumber} • ${room.departmentCode}`}
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Register Equipment"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Details */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raspberry Pi 4 Model B (4GB RAM) or Digital Storage Oscilloscope"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              >
                <option value="Microcontroller & Embedded">Microcontroller & Embedded</option>
                <option value="Sensors & Actuators">Sensors & Actuators</option>
                <option value="Test & Measuring Instruments">Test & Measuring Instruments</option>
                <option value="Development Boards & Kits">Development Boards & Kits</option>
                <option value="Power Supplies & Cables">Power Supplies & Cables</option>
                <option value="Robotics & Drones">Robotics & Drones</option>
                <option value="Computing & Peripherals">Computing & Peripherals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number / Spec
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. DSO-X 2002A or STM32F401RE"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Includes power adapter and GPIO breakout cable..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>
        </div>
      )}

      {/* Step 2: Stock & Tracking */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Quantity *
            </label>
            <input
              type="number"
              min={1}
              value={totalQuantity}
              onChange={(e) => setTotalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-32 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Inventory Tracking Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTrackingMode('QUANTITY')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  trackingMode === 'QUANTITY'
                    ? 'border-[#193A71] bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-5 h-5 text-[#193A71] mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Bulk Quantity</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Track stock by count (e.g. resistors, jumper wires, sensors)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTrackingMode('INDIVIDUAL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  trackingMode === 'INDIVIDUAL'
                    ? 'border-[#193A71] bg-blue-50/60 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Cpu className="w-5 h-5 text-[#193A71] mb-1.5" />
                <p className="text-xs font-bold text-slate-900">Asset-Tracked</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Assign unique physical asset IDs (e.g. high-value instruments)
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Equipment Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#193A71]/20 focus:border-[#193A71]"
            >
              <option value="EXCELLENT">Excellent (Brand New / Factory Calibrated)</option>
              <option value="GOOD">Good (Operational with normal wear)</option>
              <option value="FAIR">Fair (Functional, minor cosmetic wear)</option>
            </select>
          </div>
        </div>
      )}
    </WizardModal>
  );
};
