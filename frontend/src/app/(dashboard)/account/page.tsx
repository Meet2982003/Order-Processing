"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { Camera, X, Edit2, Lock, Mail, Phone, User as UserIcon, Shield, Package, MapPin, TrendingUp, Zap, Activity } from "lucide-react";

interface Account {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: string;
  createdAt: string;
  hasProfilePicture: boolean;
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-ink/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-ink/10 flex items-center justify-between bg-paper/50">
          <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-ink/50 hover:text-ink transition-colors rounded-full hover:bg-ink/10">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [pictureVersion, setPictureVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    apiFetch("/account").then((data: Account) => {
      setAccount(data);
      setFullName(data.fullName || "");
      setPhoneNumber(data.phoneNumber || "");
      setLoading(false);
    });
  }, []);



useEffect(() => {
  if (!account?.hasProfilePicture) {
    setPictureUrl(null);
    return;
  }

  const token = sessionStorage.getItem("token");
  let objectUrl: string | null = null;

  fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5384"}/account/profile-picture`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load picture");
      return res.blob();
    })
    .then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      setPictureUrl(objectUrl);
    })
    .catch(() => setPictureUrl(null));

  return () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  };
}, [account?.hasProfilePicture, pictureVersion]);

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await apiFetch("/account", {
        method: "PUT",
        body: JSON.stringify({ fullName, phoneNumber }),
      });
      setAccount(updated);
      setIsEditProfileOpen(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePictureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5384"}/account/profile-picture`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Upload failed");
      setPictureVersion((v) => v + 1);
      setAccount((a) => (a ? { ...a, hasProfilePicture: true } : a));
    } catch {
      alert("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError("");
    setPwMessage("");
    setPwLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setPwMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setPwMessage("");
      }, 1500);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  }

  if (loading || !account) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-cobalt border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  

  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Profile</h1>
        <p className="text-ink/60 text-sm mt-1">View all your profile details here.</p>
      </div>

      {/* Main Grid: Profile Card (Left) + Details Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card (Left, 5 columns) */}
        <div className="lg:col-span-5 bg-white border border-ink/10 rounded-[2rem] p-8 flex flex-col items-center text-center relative shadow-sm hover:shadow-md transition-all">
          
          {/* Layered Avatar */}
          <div className="relative group mb-8 mt-4">
            <div className="absolute inset-0 rounded-full border-[1rem] border-cobalt/5 scale-[1.25] -z-10 transition-transform duration-500 group-hover:scale-[1.30]"></div>
            <div className="absolute inset-0 rounded-full border-[0.5rem] border-cobalt/10 scale-[1.10] -z-10 transition-transform duration-500 group-hover:scale-[1.15]"></div>
            
            <div className="w-48 h-48 rounded-full bg-white border border-ink/10 shadow-lg overflow-hidden flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              {pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pictureUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-bold text-ink/20">
                  {account.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-cobalt text-white flex items-center justify-center shadow-lg hover:bg-cobalt-dark transition-all disabled:opacity-50 hover:scale-110 z-10"
              title="Update profile picture"
            >
              {uploading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <Camera size={20} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePictureChange}
              className="hidden"
            />
          </div>

          <h2 className="text-3xl font-display font-bold text-ink mb-2">{account.fullName || "Update your name"}</h2>
          <p className="text-ink/60 font-medium mb-10">{account.email}</p>

          <div className="flex gap-3 w-full mt-auto">
            <button
              onClick={() => {
                setFullName(account.fullName || "");
                setPhoneNumber(account.phoneNumber || "");
                setIsEditProfileOpen(true);
              }}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-ink text-white text-sm font-semibold px-4 py-4 hover:bg-ink/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Details Card (Right, 7 columns) */}
        <div className="lg:col-span-7 bg-white border border-ink/10 rounded-[2rem] p-8 flex flex-col shadow-sm hover:shadow-md transition-all">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-ink/5 pb-6 mb-6 gap-4">
             <div>
               <h3 className="text-xl font-display font-bold text-ink">Account Details</h3>
               <p className="text-ink/50 text-sm mt-1">Manage your personal information</p>
             </div>
             <button
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setPwError("");
                  setPwMessage("");
                  setIsChangePasswordOpen(true);
                }}
                className="text-ink/70 hover:text-ink transition-colors text-sm flex items-center gap-2 bg-paper px-4 py-2.5 rounded-xl border border-ink/10 font-medium hover:bg-ink/5 shadow-sm"
              >
                <Lock size={16} /> Change Password
             </button>
           </div>

           <div className="flex flex-col gap-3 flex-1">
             <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-paper transition-all border border-transparent hover:border-ink/5 group cursor-default">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-cobalt/10 text-cobalt flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                     <Mail size={22} />
                  </div>
                  <div>
                    <p className="text-ink/50 text-xs font-bold uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-ink font-semibold text-lg">{account.email}</p>
                  </div>
                </div>
             </div>

             <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-paper transition-all border border-transparent hover:border-ink/5 group cursor-default">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-amber/10 text-amber flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                     <Phone size={22} />
                  </div>
                  <div>
                    <p className="text-ink/50 text-xs font-bold uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-ink font-semibold text-lg">{account.phoneNumber || "Not provided"}</p>
                  </div>
                </div>
             </div>

             <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-paper transition-all border border-transparent hover:border-ink/5 group cursor-default">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-shipped/10 text-shipped flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                     <Shield size={22} />
                  </div>
                  <div>
                    <p className="text-ink/50 text-xs font-bold uppercase tracking-wider mb-1">Account Role</p>
                    <p className="text-ink font-semibold text-lg capitalize">{account.role}</p>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>

    

      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} title="Edit Profile">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
              placeholder="e.g. +1 234 567 8900"
            />
          </div>
          {message && <p className="text-sm text-alert bg-alert/10 px-3 py-2 rounded-lg">{message}</p>}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="flex-1 rounded-xl bg-paper text-ink font-semibold px-5 py-3 hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-cobalt text-white font-semibold px-5 py-3 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
            />
          </div>
          {pwError && <p className="text-sm text-alert bg-alert/10 px-3 py-2 rounded-lg">{pwError}</p>}
          {pwMessage && <p className="text-sm text-shipped bg-shipped/10 px-3 py-2 rounded-lg">{pwMessage}</p>}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(false)}
              className="flex-1 rounded-xl bg-paper text-ink font-semibold px-5 py-3 hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwLoading}
              className="flex-1 rounded-xl bg-cobalt text-white font-semibold px-5 py-3 shadow-md shadow-cobalt/25 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}