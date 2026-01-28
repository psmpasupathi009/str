"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, Edit2, Save, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import Button from "@/componets/ui/button";

export default function ProfilePage() {
  const { user, signOut, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
  });
  const [errors, setErrors] = useState<{ name?: string; phoneNumber?: string }>({});

  const handleLogout = () => {
    signOut(); // signOut already redirects to /home
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleInputChange = (field: "name" | "phoneNumber", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phoneNumber?: string } = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "Name is required";
    }

    if (formData.phoneNumber && formData.phoneNumber.trim() !== "") {
      const digitsOnly = formData.phoneNumber.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        newErrors.phoneNumber = "Phone number must be at least 10 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      showError("User not found. Please sign in again.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update user in context and localStorage
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      showSuccess("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      showError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-slate-600">Please sign in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-600 flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-1 sm:mb-2 text-slate-900">
                PROFILE
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-light">Manage your account</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="primary"
            size="sm"
            icon={<LogOut className="w-4 h-4 sm:w-5 sm:h-5" />}
          >
            LOGOUT
          </Button>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-light tracking-wide">
                ACCOUNT INFORMATION
              </h2>
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4" />}
                >
                  EDIT
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-4 h-4" />}
                  >
                    {isSaving ? "SAVING..." : "SAVE"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                    icon={<X className="w-4 h-4" />}
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-light tracking-wider">CANCEL</span>
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider block mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full bg-slate-100 border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-600 focus:outline-none focus:border-green-500 transition-colors cursor-not-allowed opacity-70"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider block mb-2">
                  FULL NAME *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className={`w-full bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors ${
                    !isEditing ? "cursor-not-allowed opacity-70 bg-slate-100" : ""
                  }`}
                  placeholder="Enter your full name"
                  style={{ color: isEditing ? 'rgb(15 23 42)' : 'rgb(15 23 42)', caretColor: isEditing ? 'rgb(14 165 233)' : 'transparent' }}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-xs sm:text-sm text-slate-600 font-light tracking-wider block mb-2">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
                  disabled={!isEditing}
                  className={`w-full bg-white border border-green-300 px-4 py-3 text-sm sm:text-base text-slate-900 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors ${
                    !isEditing ? "cursor-not-allowed opacity-70 bg-slate-100" : ""
                  }`}
                  placeholder="Enter your phone number"
                  style={{ color: isEditing ? 'rgb(15 23 42)' : 'rgb(15 23 42)', caretColor: isEditing ? 'rgb(14 165 233)' : 'transparent' }}
                />
                {errors.phoneNumber && <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>}
                {!errors.phoneNumber && (
                  <p className="text-xs text-slate-500 mt-1">Optional - Enter 10 or more digits</p>
                )}
              </div>
            </div>
          </div>

          {user.role === "ADMIN" && (
            <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-light tracking-wide text-slate-900">
                  ADMIN DASHBOARD
                </h2>
                <Button
                  asLink
                  href="/home/admin/dashboard"
                  variant="primary"
                  size="sm"
                >
                  OPEN DASHBOARD
                </Button>
              </div>
              <p className="text-sm sm:text-base text-slate-600 font-light">
                Access the admin dashboard to manage orders, track real-time updates, and view statistics.
              </p>
            </div>
          )}

          <div className="border border-green-200 bg-white shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-light tracking-wide text-slate-900">
                ORDER HISTORY
              </h2>
              <Button
                asLink
                href="/home/orders"
                variant="primary"
                size="sm"
              >
                <span className="text-xs sm:text-sm font-light tracking-wider">
                  VIEW ALL ORDERS
                </span>
              </Link>
            </div>
            <p className="text-sm sm:text-base text-slate-600 font-light">
              View and track all your orders. Click the button above to see your complete order history.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
