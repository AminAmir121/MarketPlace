"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { SubmitReport } from "../../server/server";
import styles from "./page.module.css";

function formatStoreName(value?: string | null) {
  if (!value) return "this store";
  return decodeURIComponent(value).replace(/-/g, " ");
}

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");
  const storeName = formatStoreName(searchParams.get("storeName") || searchParams.get("name"));

  const [complaint, setComplaint] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = complaint.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const result = await SubmitReport(storeName, trimmed);
    setIsSubmitting(false);

    if (result?.success) {
      toast.success("Report submitted");
      setComplaint("");
      if (vendorId) {
        router.push(`/user?vendorId=${vendorId}`);
      } else {
        router.push("/");
      }
    } else {
      toast.error(result?.message || "Failed to submit report.");
    }
  };

  return (
    <main className={styles.pageShell}>
      <section className={styles.reportCard}>
        <div className={styles.topBar}>
          <span className={styles.badge}>⚠️ Report</span>
          <p className={styles.helperText}>We review reports carefully to keep the marketplace safe.</p>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Submit Report</h1>
          <p className={styles.subtitle}>
            Share your concern about <span className={styles.storeName}>{storeName}</span>
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="complaint">
              Describe the issue
            </label>
            <textarea
              id="complaint"
              name="complaint"
              className={styles.textarea}
              placeholder="Write your complaint or report here..."
              rows={8}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<main className={styles.pageShell} />}>
      <ReportPageContent />
    </Suspense>
  );
}
