"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GetUserReports } from "../../server/server";
import styles from "../../vendor/orders/page.module.css";

type Report = {
  id: number;
  storeName: string;
  comment: string;
  status: "open" | "resolved";
  createdAt: string;
};

function formatDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      const result = await GetUserReports();

      if (result?.success) {
        setReports(result.data || []);
      } else {
        toast.error(result?.message || "Failed to load your reports.");
      }

      setIsLoading(false);
    };

    loadReports();
  }, []);

  return (
    <ProtectedRoutes>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo}>
              Marketo
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.badge}>Report history</span>
              <h1 className={styles.title}>My Reports</h1>
              <p className={styles.subtitle}>
                Track the status of complaints you&apos;ve filed against vendor stores.
              </p>
            </div>
          </section>

          <section className={styles.ordersSection}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Submitted reports</h2>
              <span className={styles.sectionCount}>{reports.length} items</span>
            </div>

            {isLoading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden>
                  ⏳
                </div>
                <h2 className={styles.emptyTitle}>Loading your reports…</h2>
              </div>
            ) : reports.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden>
                  📝
                </div>
                <h2 className={styles.emptyTitle}>No reports yet</h2>
                <p className={styles.emptyText}>
                  Reports you file against a vendor store will show up here.
                </p>
              </div>
            ) : (
              <div className={styles.ordersGrid}>
                {reports.map((report) => (
                  <article key={report.id} className={styles.orderCard}>
                    <div className={styles.cardBody}>
                      <p className={styles.orderId}>#{report.id}</p>
                      <h3 className={styles.productName}>Against {report.storeName}</h3>
                      <p className={styles.store}>{report.comment}</p>

                      <div className={styles.footerRow}>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[`status_${report.status === "open" ? "processing" : "delivered"}`]
                          }`}
                        >
                          {report.status === "open" ? "Pending review" : "Resolved"}
                        </span>
                        <span className={styles.date}>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer className={styles.footer}>
          <p>
            © 2026 <span className={styles.footerBrand}>Marketo</span> — Report history
          </p>
        </footer>
      </div>
    </ProtectedRoutes>
  );
}
