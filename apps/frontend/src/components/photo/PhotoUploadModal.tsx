'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  Camera,
  Trash2,
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import { WizardModal } from '@/components/modal/WizardModal';
import { Photo, Room } from '@/types';
import { photoService } from '@/services/photoService';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onPhotosUpdated?: () => void;
  onSuccess?: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  room,
  onPhotosUpdated,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'gallery'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Gallery state
  const [roomPhotos, setRoomPhotos] = useState<Photo[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  // Live Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Load existing room photos
  const loadGallery = async () => {
    if (!room) return;
    setIsLoadingGallery(true);
    try {
      const photos = await photoService.getRoomPhotos(room.id);
      setRoomPhotos(photos);
    } catch {
      // Ignored
    } finally {
      setIsLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (isOpen && room) {
      loadGallery();
    }
  }, [isOpen, room]);

  // Clean up camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleModalClose = () => {
    stopCamera();
    setSelectedFile(null);
    setPreviewUrl(null);
    setCapturedBlob(null);
    setCaption('');
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  // Start device camera
  const startCamera = async () => {
    setCameraError(null);
    setCapturedBlob(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera capture is not supported in this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser or upload a file.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No video camera device was found on this system.');
      } else {
        setCameraError('Unable to access camera: ' + (err.message || 'Unknown error'));
      }
      setIsCameraActive(false);
    }
  };

  // Capture photo from video stream
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          stopCamera();
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCapturedBlob(null);
      setErrorMessage(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!room) return;
    const fileToUpload = selectedFile || capturedBlob;
    if (!fileToUpload) {
      setErrorMessage('Please select a photo file or capture a photo first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await photoService.uploadPhoto(room.id, fileToUpload, caption, isPrimary);
      setSuccessMessage('Photograph uploaded successfully to Neon Object Storage bucket "lab-photos"!');
      setSelectedFile(null);
      setCapturedBlob(null);
      setPreviewUrl(null);
      setCaption('');
      await loadGallery();
      setActiveTab('gallery');
      if (onPhotosUpdated) onPhotosUpdated();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload photograph to Neon Object Storage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photograph from storage?')) return;
    try {
      await photoService.deletePhoto(photoId);
      await loadGallery();
      if (onPhotosUpdated) onPhotosUpdated();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to delete photo.');
    }
  };

  const handleSetPrimary = async (photoId: number) => {
    try {
      await photoService.setPrimaryPhoto(photoId);
      await loadGallery();
      if (onPhotosUpdated) onPhotosUpdated();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to set primary photo.');
    }
  };

  return (
    <WizardModal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={`Laboratory Photos — Room ${room?.roomNumber || ''}`}
      subtitle={room?.roomName || 'Manage verified room photographs in Neon Object Storage'}
      onSubmit={activeTab !== 'gallery' ? handleUploadSubmit : undefined}
      submitLabel="Upload Photo"
      isSubmitting={isSubmitting}
      canNext={activeTab === 'gallery' || !!(selectedFile || capturedBlob)}
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('upload');
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>File Upload</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'camera'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setActiveTab('gallery');
              loadGallery();
            }}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'gallery'
                ? 'border-[#193A71] text-[#193A71]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Room Gallery ({roomPhotos.length})</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: File Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-[#193A71] transition-colors bg-slate-50/50">
              <input
                type="file"
                id="photoFileInput"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="photoFileInput" className="cursor-pointer block">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-[#193A71] hover:underline">
                  Click to select photograph
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  Supports JPEG, PNG, and WebP (up to 10MB)
                </span>
              </label>
            </div>

            {previewUrl && (
              <div className="space-y-3">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-black/5">
                  <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caption / Description
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Workstation Area & Digital Storage Oscilloscopes"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimaryCheckbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#193A71] focus:ring-[#193A71]"
                  />
                  <label htmlFor="isPrimaryCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Set as Primary Cover Photo for this room
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Device Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {cameraError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {!isCameraActive && !capturedBlob && (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                <Camera className="w-12 h-12 text-[#193A71] mx-auto mb-3 opacity-80" />
                <h4 className="text-sm font-bold text-slate-800">Live Device Camera Capture</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click below to request browser camera permission and capture a live photograph of the lab.
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-4 px-5 py-2.5 bg-[#193A71] hover:bg-[#0F2752] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Start Camera Preview
                </button>
              </div>
            )}

            {isCameraActive && (
              <div className="space-y-3">
                <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2 bg-[#E6771C] hover:bg-[#D46914] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {capturedBlob && previewUrl && (
              <div className="space-y-3">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-black/5">
                  <Image src={previewUrl} alt="Captured preview" fill className="object-contain" />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caption / Description
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Embedded Systems Lab Bench & Microcontrollers"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#193A71]/20"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimaryCameraCheckbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#193A71]"
                  />
                  <label htmlFor="isPrimaryCameraCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Set as Primary Cover Photo for this room
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Room Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            {isLoadingGallery ? (
              <div className="text-center py-12 text-xs text-slate-400">Loading photographs...</div>
            ) : roomPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                {roomPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group relative bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex flex-col"
                  >
                    <div className="relative w-full h-32 bg-slate-100">
                      <Image
                        src={photo.publicUrl}
                        alt={photo.caption || 'Lab Photo'}
                        fill
                        className="object-cover"
                      />
                      {photo.isPrimary && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold bg-[#E6771C] text-white rounded-full flex items-center space-x-1 shadow">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Primary Cover</span>
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">
                          {photo.caption || photo.originalFilename}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Uploaded by {photo.uploadedByName} • {new Date(photo.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        {!photo.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(photo.id)}
                            className="text-[10px] font-semibold text-[#193A71] hover:underline"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-[10px] font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No photographs uploaded for this laboratory room yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="mt-3 text-xs font-bold text-[#193A71] hover:underline"
                >
                  Upload the first photo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </WizardModal>
  );
};
