"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Shield, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/button";

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
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  error,
  onFocus,
  onBlur,
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
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  const inputType = showPasswordToggle && isPasswordVisible ? "text" : type;
  
  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={fieldName} 
        className="text-xs text-slate-600 font-light tracking-wider uppercase block"
      >
        {label}
      </label>
      <div className="relative" style={{ zIndex: 60 }}>
        <div 
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            isFocused ? 'text-green-600' : 'text-slate-600'
          }`}
          style={{ zIndex: 10 }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        </div>
        <input
          id={fieldName}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          autoComplete={type === "email" ? "email" : type === "password" ? (fieldName.includes("confirm") ? "new-password" : "current-password") : "off"}
          className={`w-full bg-white border ${error ? 'border-red-300' : 'border-slate-300'} pl-10 sm:pl-11 ${showPasswordToggle ? 'pr-10 sm:pr-11' : 'pr-3'} py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-200 transition-all duration-200`}
          placeholder={placeholder}
          style={{
            color: 'rgb(15 23 42)',
            caretColor: 'rgb(14 165 233)',
            position: 'relative',
            zIndex: 60,
          }}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-green-600 active:text-green-700 transition-colors z-10 p-1"
            style={{ zIndex: 61 }}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? (
              <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            ) : (
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-light">{error}</p>
      )}
    </div>
  );
};

export function AceternityAuthForm({ type, onSubmit, isLoading }: AuthFormProps) {
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    name: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handleAPIError = (err: any, defaultMessage: string) => {
    setError(err.message || defaultMessage);
  };

  const sendOTP = async (otpType: "SIGNUP" | "FORGOT_PASSWORD") => {
    setIsSendingOTP(true);
    setError("");
    setSuccessMessage("");
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsSendingOTP(false);
      return;
    }
    
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
      
      // Show success message
      setSuccessMessage(`OTP sent successfully to ${formData.email}`);
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
    setSuccessMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: formData.otp, type: otpType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OTP verification failed");

      // Clear success message and move to next step
      setSuccessMessage("");
      if (otpType === "SIGNUP") {
        setStep("password");
      } else {
        // Clear password fields when entering reset step
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        setPasswordError("");
        setConfirmPasswordError("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setStep("reset");
      }
    } catch (err: any) {
      handleAPIError(err, "OTP verification failed");
    }
  };

  const validatePassword = (password: string): string => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const createAccount = async () => {
    const passwordErr = validatePassword(formData.password);
    const confirmPasswordErr = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);
    
    if (passwordErr || confirmPasswordErr) {
      setError(passwordErr || confirmPasswordErr);
      return;
    }

    setError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
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
    const passwordErr = validatePassword(formData.password);
    const confirmPasswordErr = validateConfirmPassword(formData.password, formData.confirmPassword);
    
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);
    
    if (passwordErr || confirmPasswordErr) {
      setError(passwordErr || confirmPasswordErr);
      return;
    }

    setError("");
    setPasswordError("");
    setConfirmPasswordError("");
    
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
    if (successMessage) {
      setSuccessMessage("");
    }

    if (step === "form" && type === "signup") {
      if (!formData.email || !formData.name) {
        setError("Email and name are required");
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      await sendOTP("SIGNUP");
    } else if (step === "form" && type === "signin") {
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
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
    return type === "signin" ? "Welcome back to STN Golden Healthy Foods" : "Create your account to get started";
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
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
    if (confirmPasswordError && formData.confirmPassword) {
      const confirmErr = validateConfirmPassword(newPassword, formData.confirmPassword);
      setConfirmPasswordError(confirmErr);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: newConfirmPassword }));
    
    // Validate immediately
    const confirmErr = validateConfirmPassword(formData.password, newConfirmPassword);
    setConfirmPasswordError(confirmErr);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, "").slice(0, 6) }));
  };

  const renderFormStep = () => (
    <form onSubmit={handleSubmit} className="space-y-3.5" style={{ position: 'relative', zIndex: 50 }}>
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
        onFocus={() => setFocusedField("email")}
        onBlur={() => setFocusedField(null)}
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
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
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
            onFocus={() => setFocusedField("phoneNumber")}
            onBlur={() => setFocusedField(null)}
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
            showPasswordToggle={true}
            isPasswordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
          />
          <div className="text-right -mt-1">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-slate-600 font-light tracking-wider uppercase hover:text-green-600 transition-colors"
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
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-light"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/30 text-green-600 text-xs font-light"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        isLoading={isLoading || isSendingOTP}
        variant="secondary"
        size="md"
        showArrow={!isLoading && !isSendingOTP}
        className="w-full"
      >
        {type === "signin" ? "SIGN IN" : "CONTINUE"}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <div className="space-y-4" style={{ position: 'relative', zIndex: 50 }}>
      <div className="text-center mb-5">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
        </div>
        <p className="text-xs text-slate-600 font-light">
          Enter the 6-digit code sent to
        </p>
        <p className="text-xs text-slate-900 font-light mt-1">
          {formData.email}
        </p>
      </div>

      <div className="relative" style={{ zIndex: 60 }}>
        <input
          type="text"
          value={formData.otp}
          onChange={handleOtpChange}
          maxLength={6}
          className="w-full bg-white border border-slate-300 focus:border-slate-500 focus:ring-1 focus:ring-slate-200 px-4 py-3 text-2xl text-center text-slate-900 tracking-[0.3em] focus:outline-none transition-all duration-200 font-mono font-light"
          placeholder="000000"
          autoFocus
          onFocus={() => setFocusedField("otp")}
          onBlur={() => setFocusedField(null)}
          style={{
            color: 'rgb(15 23 42)',
            caretColor: 'rgb(14 165 233)',
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

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={() => {
            setStep("form");
            setFormData(prev => ({ ...prev, otp: "" }));
            setError("");
            setForgotPassword(false);
          }}
          variant="outline"
          size="md"
          className="flex-1"
        >
          BACK
        </Button>
        <Button
          type="button"
          onClick={() => verifyOTP(type === "signup" ? "SIGNUP" : "FORGOT_PASSWORD")}
          isLoading={isLoading}
          disabled={formData.otp.length !== 6}
          variant="secondary"
          size="md"
          icon={!isLoading ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
          className="flex-1"
        >
          VERIFY
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-3.5" style={{ position: 'relative', zIndex: 50 }}>
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
        showPasswordToggle={true}
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        error={passwordError}
        onFocus={() => setFocusedField("password")}
        onBlur={() => setFocusedField(null)}
      />
      <InputField
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm your password"
        icon={Lock}
        required
        fieldName="confirmPassword"
        isFocused={focusedField === "confirmPassword"}
        showPasswordToggle={true}
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        error={confirmPasswordError}
        onFocus={() => setFocusedField("confirmPassword")}
        onBlur={() => setFocusedField(null)}
      />
      <div className="flex items-center gap-2 text-xs text-slate-600 font-light">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
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

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={() => {
            setStep("otp");
            setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
            setError("");
            setPasswordError("");
            setConfirmPasswordError("");
            setShowPassword(false);
            setShowConfirmPassword(false);
          }}
          variant="outline"
          size="md"
          className="flex-1"
        >
          BACK
        </Button>
        <Button
          type="button"
          onClick={createAccount}
          isLoading={isLoading}
          disabled={!formData.password || formData.password.length < 6 || !formData.confirmPassword || formData.password !== formData.confirmPassword}
          variant="secondary"
          size="md"
          icon={!isLoading ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
          className="flex-1"
        >
          CREATE ACCOUNT
        </Button>
      </div>
    </div>
  );

  const renderResetStep = () => (
    <div className="space-y-3.5" style={{ position: 'relative', zIndex: 50 }}>
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
        showPasswordToggle={true}
        isPasswordVisible={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        error={passwordError}
        onFocus={() => setFocusedField("password")}
        onBlur={() => setFocusedField(null)}
      />
      <InputField
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm your new password"
        icon={Lock}
        required
        fieldName="confirmPassword"
        isFocused={focusedField === "confirmPassword"}
        showPasswordToggle={true}
        isPasswordVisible={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        error={confirmPasswordError}
        onFocus={() => setFocusedField("confirmPassword")}
        onBlur={() => setFocusedField(null)}
      />
      <div className="flex items-center gap-2 text-xs text-slate-600 font-light">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
        <span>Password must be at least 6 characters long</span>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-light"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        onClick={resetPassword}
        isLoading={isLoading}
        disabled={!formData.password || formData.password.length < 6 || !formData.confirmPassword || formData.password !== formData.confirmPassword}
        variant="secondary"
        size="md"
        icon={!isLoading ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : undefined}
        className="w-full"
      >
        RESET PASSWORD
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-green-50 text-slate-900 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-8 sm:pb-12 relative" style={{ zIndex: 1 }}>
      <div className="w-full max-w-md mx-auto px-4 sm:px-6 relative py-4 sm:py-6" style={{ zIndex: 40 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-green-200 bg-white shadow-lg p-6 sm:p-8 relative"
          style={{ zIndex: 40 }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-light tracking-wider mb-2">
              {getStepTitle()}
            </h1>
            <p className="text-xs text-slate-600 font-light tracking-wide">
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
            <div className="mt-5 text-center">
              <p className="text-xs text-slate-600 font-light tracking-wide">
                {type === "signin" ? "Don't have an account? " : "Already have an account? "}
                <Link
                  href={type === "signin" ? "/home/signup" : "/home/signin"}
                  className="text-green-600 font-light tracking-wider underline decoration-green-400 underline-offset-4 hover:text-green-700 transition-colors"
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
