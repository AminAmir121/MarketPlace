'use client';

import { useEffect, useState } from "react";
import { CheckToken } from "../server/server";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      if (!token) {
        toast.error("You are not loggedin");
        router.push("/account");
        return;
      }

      const result = await CheckToken(token);

      if (result?.success === true) {
        setLoading(false);
      } else {
        toast.error("You are not loggedin");
        router.push("/account");
      }
    };

    verifyUser();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.shell}>
        <div className={styles.card}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.text}>Checking session...</p>
          <p className={styles.subtext}>Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}