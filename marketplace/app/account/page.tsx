"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import toast from "react-hot-toast";

import {SendOTP, Login } from "../server/server"
import { useRouter } from "next/navigation";

function GoogleIcon() {


  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function AccountPage() {

  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

   const [RegName, setRegName] = useState("");
     const [RegEmail, setRegEmail] = useState("");
     const [RegPassword, setRegPassword] = useState("");

     const [LoginEmail, setLoginEmail] = useState("");
     const [LoginPassword, setLoginPassword] = useState("");


const HandleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
        const UserData = {
            name: RegName,
            email: RegEmail,
            password: RegPassword
        };

        const OTP = await SendOTP(UserData);

        if (OTP?.success) {
            toast.success("OTP sent to your email. Please check and verify.");
            router.push(
                `/account/otp?name=${UserData.name}&email=${UserData.email}&password=${UserData.password}`
            );
        } else {
            toast.error(OTP?.message || "Failed to send OTP.");
        }
    } catch (error) {
        console.error(error);
        toast.error("Something went wrong. Please try again.");
    }
};

const HandleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const req = {
    email: LoginEmail,
    password: LoginPassword,
  };

  const result = await Login(req);
  if (result?.success) {
    if (typeof window !== "undefined") {
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }

      const userId = result?.user?.userid || result?.user?.id || result?.user?.userId || result?.user?.ID || null;
      if (userId) {
        localStorage.setItem("userId", String(userId));
      }

      const vendorName = result?.user?.name || result?.user?.fullName || result?.user?.username || null;
      if (vendorName) {
        localStorage.setItem("vendorName", String(vendorName));
      }

      const storeName = result?.user?.storeName || result?.user?.store_name || null;
      if (storeName) {
        localStorage.setItem("storeName", String(storeName));
      }
    }

    toast.success("Login successful!");
    router.push("/");
  } else {
    toast.error(result?.message || "Failed to login.");
  }
};

  return (
    <div className={styles.page}>
      <div className={styles.blob1} aria-hidden />
      <div className={styles.blob2} aria-hidden />
      <div className={styles.blob3} aria-hidden />

      <header className={styles.topBar}>
        <Link href="/" className={styles.logo}>
          Marketo
        </Link>
        <Link href="/" className={styles.backLink}>
          ← Back to shop
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.heroText}>
          <span className={styles.badge}>Welcome back</span>
          <h1 className={styles.heroTitle}>
            {isSignup ? "Create your account" : "Sign in to Marketo"}
          </h1>
          <p className={styles.heroSub}>
            {isSignup
              ? "Join thousands of shoppers and vendors on our marketplace."
              : "Access your orders, favorites, and store dashboard."}
          </p>
        </div>

        <div className={styles.flipScene}>
          <div
            className={`${styles.flipInner} ${isSignup ? styles.flipped : ""}`}
          >
            {/* Login — front */}
            <div className={styles.flipFace}>
              <form className={styles.form} onSubmit={HandleLogin}>
                <h2 className={styles.formTitle}>Log in</h2>
                <p className={styles.formSub}>Enter your credentials to continue</p>

                <label className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <div className={styles.inputWrap}>
                    <MailIcon />
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      autoComplete="email"
                      onChange={(e)=>{
                        setLoginEmail(e.target.value)
                      }}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Password</span>
                  <div className={styles.inputWrap}>
                    <LockIcon />
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="••••••••"
                      autoComplete="current-password"
                       onChange={(e)=>{
                        setLoginPassword(e.target.value)
                      }}
                    />
                  </div>
                </label>

                <div className={styles.forgotRow}>
                  <Link href="/account/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Log In
                </button>

                <p className={styles.switchText}>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className={styles.switchBtn}
                    onClick={() => setIsSignup(true)}
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </div>

            {/* Signup — back */}
            <div className={`${styles.flipFace} ${styles.flipBack}`}>
              <form className={styles.form} onSubmit={HandleRegister}>
                <h2 className={styles.formTitle}>Sign up</h2>
                <p className={styles.formSub}>Create your Marketo account</p>

                <label className={styles.field}>
                  <span className={styles.label}>Full name</span>
                  <div className={styles.inputWrap}>
                    <UserIcon />
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Alex Johnson"
                      autoComplete="name"
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <div className={styles.inputWrap}>
                    <MailIcon />
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="you@example.com"
                      autoComplete="email"
                       onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Password</span>
                  <div className={styles.inputWrap}>
                    <LockIcon />
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="Create a password"
                      autoComplete="new-password"
                       onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className={styles.submitBtn}
                >
                  Create account
                </button>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button type="button" className={styles.googleBtn}>
                  <GoogleIcon />
                  <span className={styles.googleBtnText}>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className={styles.loginFlipBtn}
                  onClick={() => setIsSignup(false)}
                >
                  Already have an account? Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
