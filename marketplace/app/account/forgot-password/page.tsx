"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { RequestPasswordReset, ResetPassword } from "../../server/server";
import styles from "../otp/page.module.css";

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3 5 6v6c0 5 3.4 8.2 7 9 3.6-.8 7-4 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.3-3.4" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const result = await RequestPasswordReset(email);
    setIsLoading(false);

    if (result?.success) {
      toast.success("OTP sent to your email.");
      setStep("reset");
    } else {
      toast.error(result?.message || "Failed to send OTP.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp)) {
      toast.error("Please enter the 4-digit OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await ResetPassword(email, otp, newPassword);
    setIsLoading(false);

    if (result?.success) {
      toast.success("Password reset successfully. Please log in.");
      router.push("/account");
    } else {
      toast.error(result?.message || "Failed to reset password.");
    }
  };

  return (
    <main className={styles.pageShell}>
      <section className={styles.card}>
        <div className={styles.iconWrap} aria-hidden>
          <ShieldIcon />
        </div>

        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          {step === "email"
            ? "Enter your account email to receive a reset OTP."
            : "Enter the OTP sent to your email and choose a new password."}
        </p>

        {step === "email" ? (
          <form className={styles.form} onSubmit={handleRequestOtp}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <span className={styles.loaderRow}>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Sending...</span>
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleResetPassword}>
            <label className={styles.label} htmlFor="otp">
              Enter 4-digit OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoComplete="one-time-code"
              placeholder="0000"
              className={styles.input}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <label className={styles.label} htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Create a new password"
              className={styles.input}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <span className={styles.loaderRow}>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span>Resetting...</span>
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <p className={styles.subtitle}>
          <Link href="/account">← Back to login</Link>
        </p>
      </section>
    </main>
  );
}
