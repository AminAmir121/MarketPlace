'use client';

import type { FormEvent } from "react";
import { Suspense, useState } from "react";
import styles from "./page.module.css";
import { useSearchParams } from "next/navigation";
import { VerifyOTP } from "../../server/server";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { RegisterUser } from "../../server/server";



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

function OtpPageContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const name = searchParams.get("name");
 const email = searchParams.get("email");
 const password = searchParams.get("password");

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email not found. Please sign up again.");
      return;
    }

    if (!/^\d{4}$/.test(otp)) {
      toast.error("Please enter the 4-digit OTP.");
      return;
    }

    setIsLoading(true);

    const req = {
      email: email,
      enteredOtp: otp,
    };

    const RegReq = {
      name: name,
      email: email,
      password: password,
    };

    try {
      const result = await VerifyOTP(req);

      if (result?.success === true) {
        const register = await RegisterUser(RegReq);
        if (register && register.success === true) {
          toast.success("User registered successfully! Login Please");
          router.push("/account");
        } else {
          toast.error(register?.message || "Registration failed. Please try again.");
        }
      } else {
        toast.error(result?.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className={styles.pageShell}>
      <section className={styles.card}>
        <div className={styles.iconWrap} aria-hidden>
          <ShieldIcon />
        </div>

        <h1 className={styles.title}>Verify OTP</h1>
        <p className={styles.subtitle}>
          OTP has been sent to your email. Please check and enter it here.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
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

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <span className={styles.loaderRow}>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Verifying...</span>
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<main className={styles.pageShell}><section className={styles.card}><p className={styles.subtitle}>Loading…</p></section></main>}>
      <OtpPageContent />
    </Suspense>
  );
}
