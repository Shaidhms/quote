"use client";

import { useState, useRef } from "react";
import { UserSettings } from "@/types";
import { User, X, Camera, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { exportAllData, importAllData, downloadAsFile } from "@/lib/dataPortability";

interface ProfileSettingsProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSetImage: (file: File) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSettings({
  settings,
  onUpdate,
  onSetImage,
  isOpen,
  onClose,
}: ProfileSettingsProps) {
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportAllData();
    const date = new Date().toISOString().slice(0, 10);
    downloadAsFile(json, `shaid-content-backup-${date}.json`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(reader.result as string);
      if (result.success) {
        const total = Object.values(result.counts).reduce((a, b) => a + b, 0);
        setImportStatus({ type: "success", message: `Imported ${total} items. Reloading...` });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportStatus({ type: "error", message: result.error ?? "Import failed" });
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Profile image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {settings.profile_image_url ? (
              <img
                src={settings.profile_image_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSetImage(file);
                }}
              />
            </label>
          </div>
          <p className="text-xs text-slate-400 mt-2">Click camera to upload photo</p>
        </div>

        {/* Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={settings.display_name}
              onChange={(e) => onUpdate({ display_name: e.target.value })}
              placeholder="Your name for quote cards"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              LinkedIn Handle
            </label>
            <input
              type="text"
              value={settings.linkedin_handle}
              onChange={(e) => onUpdate({ linkedin_handle: e.target.value })}
              placeholder="@yourhandle"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Data Management */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Data Management</h3>
          <p className="text-xs text-slate-400 mb-3">
            Transfer your data between localhost and deployed site
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
          {importStatus && (
            <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
              importStatus.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}>
              {importStatus.type === "success"
                ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              }
              {importStatus.message}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}
