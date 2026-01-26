"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Shield, CheckCircle2, ArrowRight } from "lucide-react";

interface AuthFormProps {
  type: "signin" | "signup";
  onSubmit: (email: string, password?: string, name?: string, otp?: string, phoneNumber?: string) => Promise<void>;
  isLoading?: boolean;
}

type Step = "form" | "otp" | "password" | "reset";

// Move InputField outside to prevent recreation
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
  isFocused,
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
  isFocused: boolean;
}) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldName} 
        className="text-xs sm:text-sm text-gray-400 font-light tracking-wider uppercase block"
      >
        {label}
      </label>
      <div className="relative" style={{ zIndex: 60 }}>
        <div 
          className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            isFocused ? 'text-white' : 'text-gray-500'
          }`}
          style={{ zIndex: 1 }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <input
          id={fieldName}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          autoComplete={type === "email" ? "email" : type === "password" ? "current-password" : "off"}
          className="w-full bg-black border border-white/10 pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-200"
          placeholder={placeholder}
          style={{
            color: 'white',
            caretColor: 'white',
            position: 'relative',
            zIndex: 60,
          }}
        />
      </div>
    </div>
  );
};

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
    e.stopPropagation();
    
    if (error) {
      setError("");
    }

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
    if (step === "otp") return "VERIFY EMAIL";
    if (step === "password") return "CREATE PASSWORD";
    if (step === "reset") return "RESET PASSWORD";
    return type === "signin" ? "SIGN IN" : "SIGN UP";
  };

  const getStepDescription = () => {
    if (step === "otp") return "Enter the 6-digit code sent to your email";
    if (step === "password") return "Choose a strong password to secure your account";
    if (step === "reset") return "Enter your new password";
    return type === "signin" ? "Welcome back to STR" : "Create your account to get started";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, "") }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }));
  };

  const renderFormStep = () => (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6" style={{ position: 'relative', zIndex: 50 }}>
      <InputField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={handleEmailChange}
        placeholder="you@example.com"
        icon={Mail}
        required
        fieldName="email"
        isFocused={focusedField === "email"}
      />

      {type === "signup" && (
        <>
          <InputField
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="John Doe"
            icon={User}
            required
            fieldName="name"
            isFocused={focusedField === "name"}
          />
          <InputField
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="1234567890"
            icon={Phone}
            fieldName="phoneNumber"
            isFocused={focusedField === "phoneNumber"}
          />
        </>
      )}

      {type === "signin" && (
        <>
          <InputField
            label="Password"
            type="password"
            value={formData.password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            icon={Lock}
            required
            fieldName="password"
            isFocused={focusedField === "password"}
          />
          <div className="text-right -mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs sm:text-sm text-gray-400 font-light tracking-wider uppercase"
            >
              Forgot Password?
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-light"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isLoading || isSendingOTP}
        className="w-full bg-white text-black py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 font-light tracking-widest text-xs sm:text-sm uppercase transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading || isSendingOTP ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            PROCESSING...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {type === "signin" ? "SIGN IN" : "CONTINUE"}
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6" style={{ position: 'relative', zIndex: 50 }}>
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-400 font-light">
          Enter the 6-digit code sent to
        </p>
        <p className="text-xs sm:text-sm md:text-base text-white font-light mt-1">
          {formData.email}
        </p>
      </div>

      <div className="relative" style={{ zIndex: 60 }}>
        <input
          type="text"
          value={formData.otp}
          onChange={handleOtpChange}
          maxLength={6}
          className="w-full bg-black border border-white/10 focus:border-white/30 px-4 sm:px-6 py-3 sm:py-4 md:py-5 text-2xl sm:text-3xl md:text-4xl text-center text-white tracking-[0.3em] sm:tracking-[0.5em] focus:outline-none transition-all duration-200 font-mono font-light"
          placeholder="000000"
          autoFocus
          onFocus={() => setFocusedField("otp")}
          onBlur={() => setFocusedField(null)}
          style={{
            color: 'white',
            caretColor: 'white',
            position: 'relative',
            zIndex: 60,
          }}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-light"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => {
            setStep("form");
            setFormData(prev => ({ ...prev, otp: "" }));
            setError("");
            setForgotPassword(false);
          }}
          className="flex-1 bg-black border border-white/10 text-white py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 font-light tracking-widest text-xs sm:text-sm uppercase transition-all duration-200"
        >
          BACK
        </button>
        <button
          type="button"
          onClick={() => verifyOTP(type === "signup" ? "SIGNUP" : "FORGOT_PASSWORD")}
          disabled={isLoading || formData.otp.length !== 6}
          className="flex-1 bg-white text-black py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 font-light tracking-widest text-xs sm:text-sm uppercase transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              VERIFYING...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              VERIFY
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6" style={{ position: 'relative', zIndex: 50 }}>
      <InputField
        label="Create Password"
        type="password"
        value={formData.password}
        onChange={handlePasswordChange}
        placeholder="Enter a strong password"
        icon={Lock}
        required
        fieldName="password"
        isFocused={focusedField === "password"}
      />
      <div className="flex items-center gap-2 text-xs text-gray-500 font-light">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Password must be at least 6 characters long</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-light"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => {
            setStep("otp");
            setFormData(prev => ({ ...prev, password: "" }));
            setError("");
          }}
          className="flex-1 bg-black border border-white/10 text-white py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 font-light tracking-widest text-xs sm:text-sm uppercase transition-all duration-200"
        >
          BACK
        </button>
        <button
          type="button"
          onClick={createAccount}
          disabled={isLoading || !formData.password || formData.password.length < 6}
          className="flex-1 bg-white text-black py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 font-light tracking-widest text-xs sm:text-sm uppercase transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              />
              CREATING...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              CREATE ACCOUNT
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6" style={{ position: 'relative', zIndex: 50 }}>
      <InputField
        label="New Password"
        type="password"
        value={formData.password}
        onChange={handlePasswordChange}
        placeholder="Enter your new password"
        icon={Lock}
        required
        fieldName="password"
        isFocused={focusedField === "password"}
      />
      <div className="flex items-center gap-2 text-xs text-gray-500 font-light">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
        <span>Password must be at least 6 characters long</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 sm:p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm font-light"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={resetPassword}
        disabled={isLoading || !formData.password || formData.password.length < 6}
        className="w-full bg-white text-black py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 font-light tracking-widest text-xs sm:text-sm uppercase transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
            RESETTING...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            RESET PASSWORD
            <CheckCircle2 className="w-4 h-4" />
          </span>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 md:pb-12 relative" style={{ zIndex: 1 }}>
      <div className="max-w-md mx-auto px-3 sm:px-4 md:px-6 relative" style={{ zIndex: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-white/10 bg-black p-4 sm:p-6 md:p-8 lg:p-10 relative"
          style={{ zIndex: 40 }}
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8 md:mb-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider mb-2 sm:mb-3 md:mb-4">
              {getStepTitle()}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-400 font-light tracking-wide">
              {getStepDescription()}
            </p>
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
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
                transition={{ duration: 0.3 }}
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
                transition={{ duration: 0.3 }}
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
                transition={{ duration: 0.3 }}
              >
                {renderResetStep()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Link */}
          {step === "form" && (
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-xs sm:text-sm text-gray-400 font-light tracking-wide">
                {type === "signin" ? "Don't have an account? " : "Already have an account? "}
                <Link
                  href={type === "signin" ? "/signup" : "/signin"}
                  className="text-white font-light tracking-wider underline decoration-white/50 underline-offset-4"
                >
                  {type === "signin" ? "SIGN UP" : "SIGN IN"}
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
