"use client";

import { useState, useRef } from "react";
import { UserSettings, WatermarkPosition } from "@/types";
import { User, X, Camera, Download, Upload, CheckCircle2, AlertCircle, Cloud, Palette, Type, Image as ImageIcon, Trash2 } from "lucide-react";
import { exportAllData, importAllData, downloadAsFile, syncToSupabase } from "@/lib/dataPortability";

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
  const [syncStatus, setSyncStatus] = useState<{ type: "progress" | "success" | "error"; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
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

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus({ type: "progress", message: "Starting sync..." });
    const result = await syncToSupabase((p) => {
      setSyncStatus({ type: "progress", message: p.step });
    });
    if (result.success) {
      setSyncStatus({ type: "success", message: "All data synced to cloud! Reloading..." });
      setTimeout(() => window.location.reload(), 1500);
    } else {
      setSyncStatus({ type: "error", message: result.error ?? "Sync failed" });
      setSyncing(false);
    }
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

          {/* Sync to Cloud */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2">
              Push localStorage data to Supabase for persistent cloud storage
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Cloud className="w-4 h-4" />
              {syncing ? "Syncing..." : "Sync to Cloud"}
            </button>
            {syncStatus && (
              <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                syncStatus.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : syncStatus.type === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-700"
              }`}>
                {syncStatus.type === "success"
                  ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  : syncStatus.type === "error"
                  ? <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  : <Cloud className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
                }
                {syncStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* Brand Kit */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-700">Brand Kit</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Colors, font & watermark for your content
          </p>

          {/* Brand Colors */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-2">Brand Colors</label>
            <div className="flex items-center gap-2">
              {(settings.brand_colors ?? ["#2563eb", "#10b981"]).map((color, i) => (
                <label key={i} className="relative cursor-pointer">
                  <div
                    className="w-9 h-9 rounded-lg border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const updated = [...(settings.brand_colors ?? ["#2563eb", "#10b981"])];
                      updated[i] = e.target.value;
                      onUpdate({ brand_colors: updated });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              ))}
              {(settings.brand_colors ?? []).length < 4 && (
                <button
                  onClick={() => onUpdate({ brand_colors: [...(settings.brand_colors ?? ["#2563eb", "#10b981"]), "#6366f1"] })}
                  className="w-9 h-9 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
                >
                  +
                </button>
              )}
              {(settings.brand_colors ?? []).length > 1 && (
                <button
                  onClick={() => onUpdate({ brand_colors: (settings.brand_colors ?? []).slice(0, -1) })}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors ml-1"
                  title="Remove last color"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Brand Font */}
          <div className="mb-4">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <Type className="w-3.5 h-3.5" /> Brand Font
            </label>
            <select
              value={settings.brand_font ?? "Inter"}
              onChange={(e) => onUpdate({ brand_font: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Georgia">Georgia</option>
              <option value="Arial">Arial</option>
            </select>
          </div>

          {/* Watermark */}
          <div className="mb-3">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Watermark Image
            </label>
            {settings.watermark_image_url ? (
              <div className="flex items-center gap-3">
                <img
                  src={settings.watermark_image_url}
                  alt="Watermark"
                  className="w-16 h-16 object-contain bg-slate-50 border border-slate-200 rounded-lg p-1"
                />
                <button
                  onClick={() => onUpdate({ watermark_image_url: "" })}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors">
                <Upload className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Upload watermark (PNG recommended)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      onUpdate({ watermark_image_url: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}
          </div>

          {/* Position + Opacity */}
          {settings.watermark_image_url && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">Position</label>
                <select
                  value={settings.watermark_position ?? "bottom-right"}
                  onChange={(e) => onUpdate({ watermark_position: e.target.value as WatermarkPosition })}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Opacity ({Math.round((settings.watermark_opacity ?? 0.7) * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.watermark_opacity ?? 0.7}
                  onChange={(e) => onUpdate({ watermark_opacity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
              </div>
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
