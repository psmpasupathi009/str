"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Shield, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface AuthFormProps {
  type: "signin" | "signup";
  onSubmit: (email: string, password?: string, name?: string, otp?: string, phoneNumber?: string) => Promise<void>;
  isLoading?: boolean;
}

type Step = "form" | "otp" | "password" | "reset";

export function AceternityAuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    name: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleAPIError = (err: any, defaultMessage: string) => {
    setError(err.message || defaultMessage);
  };

  const sendOTP = async (otpType: "SIGNUP" | "FORGOT_PASSWORD") => {
    setIsSendingOTP(true);
    setError("");
    try {
      const endpoint = type === "signup" ? "/api/auth/signup" : "/api/auth/send-otp";
      const body = type === "signup" 
        ? { email: formData.email, name: formData.name, phoneNumber: formData.phoneNumber }
        : { email: formData.email, type: otpType };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep("otp");
    } catch (err: any) {
      handleAPIError(err, "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async (otpType: "SIGNUP" | "FORGOT_PASSWORD") => {
    if (formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: formData.otp, type: otpType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");

      if (otpType === "SIGNUP") {
        setStep("password");
      } else {
        setStep("reset");
      }
    } catch (err: any) {
      handleAPIError(err, "OTP verification failed");
    }
  };

  const createAccount = async () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    try {
      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create account");

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        setError("Account created but login failed. Please sign in manually.");
      }
    } catch (err: any) {
      handleAPIError(err, "Failed to create account");
    }
  };

  const resetPassword = async () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to reset password");

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        setError("Password reset successful but login failed. Please sign in manually.");
      }
    } catch (err: any) {
      handleAPIError(err, "Failed to reset password");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "form" && type === "signup") {
      if (!formData.email || !formData.name) {
        setError("Email and name are required");
        return;
      }
      await sendOTP("SIGNUP");
    } else if (step === "form" && type === "signin") {
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        return;
      }
      try {
        await onSubmit(formData.email, formData.password);
      } catch (err: any) {
        handleAPIError(err, "Sign in failed. Please check your credentials.");
      }
    }
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
    sendOTP("FORGOT_PASSWORD");
  };

  const getStepTitle = () => {
    if (step === "otp") return "Verify Your Email";
    if (step === "password") return "Create Password";
    if (step === "reset") return "Reset Password";
    return type === "signin" ? "Welcome Back" : "Get Started";
  };

  const getStepDescription = () => {
    if (step === "otp") return "We've sent a 6-digit code to your email";
    if (step === "password") return "Choose a strong password to secure your account";
    if (step === "reset") return "Enter your new password";
    return type === "signin" ? "Sign in to continue to STR" : "Create your account in seconds";
  };

  const InputField = ({ 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon, 
    required = false,
    fieldName,
    maxLength,
  }: {
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: any;
    required?: boolean;
    fieldName: string;
    maxLength?: number;
  }) => {
    const isFocused = focusedField === fieldName;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <label className="text-xs font-semibold text-white/80 mb-2.5 tracking-wide uppercase">
          {label}
        </label>
        <div className="relative">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-purple-400' : 'text-white/40'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
            required={required}
            maxLength={maxLength}
            className={`w-full bg-white/5 border-2 ${isFocused ? 'border-purple-500/50 bg-white/10' : 'border-white/10 bg-white/5'} px-12 py-4 text-base text-white placeholder-white/30 focus:outline-none transition-all duration-300 rounded-2xl backdrop-blur-xl shadow-xl`}
            placeholder={placeholder}
          />
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>
      </motion.div>
    );
  };

  const renderFormStep = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <InputField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => updateField("email", e.target.value)}
        placeholder="you@example.com"
        icon={Mail}
        required
        fieldName="email"
      />

      {type === "signup" && (
        <>
          <InputField
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="John Doe"
            icon={User}
            required
            fieldName="name"
          />
          <InputField
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateField("phoneNumber", e.target.value.replace(/\D/g, ""))}
            placeholder="1234567890"
            icon={Phone}
            fieldName="phoneNumber"
          />
        </>
      )}

      {type === "signin" && (
        <>
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Enter your password"
            icon={Lock}
            required
            fieldName="password"
          />
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-purple-300 hover:text-purple-200 transition-colors font-medium"
            >
              Forgot Password?
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={isLoading || isSendingOTP}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-base tracking-wide transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/30 group"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading || isSendingOTP ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              Processing...
            </>
          ) : (
            <>
              {type === "signup" ? "Send Verification Code" : "Sign In"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </span>
      </motion.button>
    </motion.form>
  );

  const renderOTPStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border-2 border-purple-500/30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-10 h-10 text-purple-300" />
        </motion.div>
        <p className="text-white/60 text-sm mt-4">
          Enter the 6-digit code sent to<br />
          <span className="text-purple-300 font-semibold">{formData.email}</span>
        </p>
      </motion.div>

      <div className="relative">
        <input
          type="text"
          value={formData.otp}
          onChange={(e) => updateField("otp", e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          className="w-full bg-white/5 border-2 border-white/10 focus:border-purple-500/50 focus:bg-white/10 px-6 py-5 text-4xl text-center text-white tracking-[0.5em] focus:outline-none transition-all duration-300 rounded-2xl backdrop-blur-xl shadow-xl font-mono font-bold"
          placeholder="000000"
          autoFocus
        />
        {focusedField === "otp" && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={() => {
            setStep("form");
            updateField("otp", "");
            setError("");
            setForgotPassword(false);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 border-2 border-white/10 hover:border-white/20 backdrop-blur-xl"
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={() => verifyOTP(type === "signup" ? "SIGNUP" : "FORGOT_PASSWORD")}
          disabled={isLoading || formData.otp.length !== 6}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/30"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Verifying...
              </>
            ) : (
              <>
                Verify
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderPasswordStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <InputField
        label="Create Password"
        type="password"
        value={formData.password}
        onChange={(e) => updateField("password", e.target.value)}
        placeholder="Enter a strong password"
        icon={Lock}
        required
        fieldName="password"
      />
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Shield className="w-4 h-4" />
        <span>Password must be at least 6 characters long</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={() => {
            setStep("otp");
            updateField("password", "");
            setError("");
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 border-2 border-white/10 hover:border-white/20 backdrop-blur-xl"
        >
          Back
        </motion.button>
        <motion.button
          type="button"
          onClick={createAccount}
          disabled={isLoading || !formData.password || formData.password.length < 6}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/30"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Creating...
              </>
            ) : (
              <>
                Create Account
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderResetStep = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <InputField
        label="New Password"
        type="password"
        value={formData.password}
        onChange={(e) => updateField("password", e.target.value)}
        placeholder="Enter your new password"
        icon={Lock}
        required
        fieldName="password"
      />
      <div className="flex items-center gap-2 text-xs text-white/50">
        <Shield className="w-4 h-4" />
        <span>Password must be at least 6 characters long</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={resetPassword}
        disabled={isLoading || !formData.password || formData.password.length < 6}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/30"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundSize: "200% 200%",
          }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              Resetting...
            </>
          ) : (
            <>
              Reset Password
              <CheckCircle2 className="w-5 h-5" />
            </>
          )}
        </span>
      </motion.button>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Blobs */}
        {[
          { delay: 0, color: "purple", pos: "top-0 -left-4", size: "w-96 h-96" },
          { delay: 2, color: "blue", pos: "top-0 -right-4", size: "w-96 h-96" },
          { delay: 4, color: "pink", pos: "-bottom-8 left-20", size: "w-96 h-96" },
        ].map((config, i) => (
          <motion.div
            key={i}
            className={`absolute ${config.pos} ${config.size} bg-${config.color}-500 rounded-full mix-blend-screen opacity-20 filter blur-3xl`}
            animate={{
              x: [0, i === 1 ? -100 : 100, 0],
              y: [0, 100, i === 2 ? -100 : 100],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              delay: config.delay,
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Animated Spotlight */}
        <motion.div
          className="absolute w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 20,
          }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"
      >
        {/* Glow Effects */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-50 blur-2xl" />
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 opacity-20 blur-xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-10 text-center"
          >
            <motion.h1
              className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text"
              style={{ WebkitTextFillColor: 'transparent' }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 200%",
                WebkitTextFillColor: 'transparent',
              }}
            >
              {getStepTitle()}
            </motion.h1>
            <p className="text-white/60 text-base font-light">
              {getStepDescription()}
            </p>
          </motion.div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {renderFormStep()}
              </motion.div>
            )}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {renderOTPStep()}
              </motion.div>
            )}
            {step === "password" && (
              <motion.div
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {renderPasswordStep()}
              </motion.div>
            )}
            {step === "reset" && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
              >
                {renderResetStep()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Link */}
          {step === "form" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-white/60 text-sm font-light">
                {type === "signin" ? "Don't have an account? " : "Already have an account? "}
                <Link
                  href={type === "signin" ? "/signup" : "/signin"}
                  className="text-purple-300 hover:text-purple-200 transition-colors font-semibold underline decoration-2 underline-offset-4"
                >
                  {type === "signin" ? "Sign Up" : "Sign In"}
                </Link>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
