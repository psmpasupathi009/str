"use client";

import { User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-center text-gray-400">Please sign in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-1 sm:mb-2">
                PROFILE
              </h1>
              <p className="text-sm sm:text-base text-gray-400 font-light">Manage your account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-white/20 hover:border-white/40 transition-all"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-light tracking-wider">LOGOUT</span>
          </button>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="border border-white/10 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-light tracking-wide mb-3 sm:mb-4">
              ACCOUNT INFORMATION
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm text-gray-400 font-light tracking-wider block mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-gray-400 font-light tracking-wider block mb-2">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={user.name || ""}
                  readOnly
                  className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors cursor-not-allowed opacity-70"
                />
              </div>
              {user.phoneNumber && (
                <div>
                  <label className="text-xs sm:text-sm text-gray-400 font-light tracking-wider block mb-2">
                    PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={user.phoneNumber}
                    readOnly
                    className="w-full bg-black border border-white/10 px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-colors cursor-not-allowed opacity-70"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border border-white/10 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-light tracking-wide mb-3 sm:mb-4">
              ORDER HISTORY
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-light">
              No orders yet. Start shopping to see your order history here.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
