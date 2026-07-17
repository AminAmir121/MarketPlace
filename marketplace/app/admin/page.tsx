"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProtectedRoutes from "../components/ProtectedRoutes";
import { GetUserRole, GetAllVendorStores, BanStore, GetAdminReports, ResolveReport, GetPendingAds, ApproveAd, RejectAd } from "../server/server";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import styles from "./page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

type VendorStore = {
  vendorId: number;
  vendorName: string;
  email: string;
  storeName: string;
  productCount: number;
  joinedAt: string;
};

type AdminReport = {
  id: number;
  storeName: string;
  comment: string;
  status: "open" | "resolved";
  createdAt: string;
  reporterEmail: string;
};

type PendingAd = {
  id: number;
  name: string;
  price: number;
  storeName: string;
  description: string;
  image: string;
  createdAt: string;
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
};

const DUMMY_TOTAL_REVENUE = 42100;

const REVENUE_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const REVENUE_DATA = [18200, 22400, 19800, 28600, 31200, 35800, 42100];

const ACTIVITY = [
  { id: 1, text: "New store BrewCraft registered", time: "2h ago", type: "store" },
  { id: 2, text: "Report RPT-4421 filed against SoundWave", time: "5h ago", type: "report" },
  { id: 3, text: "TechVault crossed $12K revenue", time: "1d ago", type: "revenue" },
  { id: 4, text: "Vendor Maria Garcia updated 3 listings", time: "1d ago", type: "vendor" },
];

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US")}`;
}

function getStoreInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AdminPageContent() {
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [stores, setStores] = useState<VendorStore[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [banningId, setBanningId] = useState<number | null>(null);
  const [decidingId, setDecidingId] = useState<number | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      const result = await GetUserRole();

      if (result?.success && result?.data?.role === "admin") {
        setIsCheckingRole(false);
      } else {
        toast.error("Restricted access");
        router.push("/account");
      }
    };

    verifyAdmin();
  }, [router]);

  useEffect(() => {
    if (isCheckingRole) return;

    const loadData = async () => {
      const [storesResult, reportsResult, pendingAdsResult] = await Promise.all([
        GetAllVendorStores(),
        GetAdminReports(),
        GetPendingAds(),
      ]);

      if (storesResult?.success) {
        setStores(storesResult.data || []);
      } else {
        toast.error(storesResult?.message || "Failed to load vendor stores.");
      }

      if (reportsResult?.success) {
        setReports(reportsResult.data || []);
      } else {
        toast.error(reportsResult?.message || "Failed to load reports.");
      }

      if (pendingAdsResult?.success) {
        setPendingAds(pendingAdsResult.data || []);
      } else {
        toast.error(pendingAdsResult?.message || "Failed to load pending ads.");
      }
    };

    loadData();
  }, [isCheckingRole]);

  const openReports = useMemo(
    () => reports.filter((r) => r.status === "open").length,
    [reports]
  );

  const decideAd = async (productId: number, approve: boolean) => {
    setDecidingId(productId);
    const result = approve ? await ApproveAd(productId) : await RejectAd(productId);
    setDecidingId(null);

    if (result?.success) {
      setPendingAds((prev) => prev.filter((ad) => ad.id !== productId));
      toast.success(approve ? "Ad approved." : "Ad rejected.");
    } else {
      toast.error(result?.message || "Failed to update ad.");
    }
  };

  const banStore = async (vendorId: number) => {
    setBanningId(vendorId);
    const result = await BanStore(vendorId);
    setBanningId(null);

    if (result?.success) {
      setStores((prev) => prev.filter((s) => s.vendorId !== vendorId));
      toast.success("Store banned, vendor removed, and notification email sent.");
    } else {
      toast.error(result?.message || "Failed to ban store.");
    }
  };

  const resolveReport = async (id: number) => {
    const result = await ResolveReport(id);

    if (result?.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "resolved" as const } : r))
      );
      toast.success("Report marked as resolved.");
    } else {
      toast.error(result?.message || "Failed to resolve report.");
    }
  };

  const revenueChartData = {
    labels: REVENUE_MONTHS,
    datasets: [
      {
        label: "Platform revenue",
        data: REVENUE_DATA,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: "#22d3ee",
        pointBorderColor: "#0b0f1a",
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#94a3b8",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => ` $${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.08)" },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.08)" },
        ticks: {
          color: "#64748b",
          callback: (v) => `$${Number(v) / 1000}k`,
        },
      },
    },
  };

  if (isCheckingRole) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOrb} aria-hidden />
      <div className={styles.glowOrb2} aria-hidden />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.brandName}>
              Marketo
            </Link>
            <span className={styles.brandDivider} />
            <h1 className={styles.portalTitle}>Admin Portal</h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.livePill}>
              <span className={styles.liveDot} />
              System online
            </span>
            <Link href="/" className={styles.exitBtn}>
              Exit to site
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats */}
        <section className={styles.statGrid}>
          <article className={`${styles.statCard} ${styles.statCyan}`}>
            <div className={styles.statIcon}>🏪</div>
            <p className={styles.statLabel}>Total stores</p>
            <p className={styles.statValue}>{stores.length}</p>
            <p className={styles.statSub}>Live vendor stores on Marketo</p>
          </article>
          <article className={`${styles.statCard} ${styles.statViolet}`}>
            <div className={styles.statIcon}>👤</div>
            <p className={styles.statLabel}>Total vendors</p>
            <p className={styles.statValue}>{stores.length}</p>
            <p className={styles.statSub}>Active marketplace sellers</p>
          </article>
          <article className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>💰</div>
            <p className={styles.statLabel}>Total revenue</p>
            <p className={styles.statValue}>{formatPrice(DUMMY_TOTAL_REVENUE)}</p>
            <p className={styles.statSub}>+24% growth this quarter</p>
          </article>
          <article className={`${styles.statCard} ${styles.statRose}`}>
            <div className={styles.statIcon}>⚠️</div>
            <p className={styles.statLabel}>Open reports</p>
            <p className={styles.statValue}>{openReports}</p>
            <p className={styles.statSub}>{reports.length} total · Awaiting admin review</p>
          </article>
        </section>

        {/* Chart + Activity row */}
        <section className={styles.midGrid}>
          <div className={styles.chartCard}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Revenue overview</h2>
                <p className={styles.cardSub}>Platform earnings — last 7 months</p>
              </div>
              <span className={styles.chartBadge}>Live</span>
            </div>
            <div className={styles.chartWrap}>
              <Line data={revenueChartData} options={revenueOptions} />
            </div>
          </div>

          <div className={styles.activityCard}>
            <h2 className={styles.cardTitle}>Recent activity</h2>
            <ul className={styles.activityList}>
              {ACTIVITY.map((item) => (
                <li key={item.id} className={styles.activityItem}>
                  <span className={`${styles.activityDot} ${styles[`act_${item.type}`]}`} />
                  <div>
                    <p className={styles.activityText}>{item.text}</p>
                    <time className={styles.activityTime}>{item.time}</time>
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <span className={styles.quickVal}>98.2%</span>
                <span className={styles.quickLbl}>Uptime</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.quickVal}>1.2K</span>
                <span className={styles.quickLbl}>Daily users</span>
              </div>
              <div className={styles.quickStat}>
                <span className={styles.quickVal}>4.7</span>
                <span className={styles.quickLbl}>Avg rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pending ad approvals */}
        <section className={styles.reportsSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Pending ad approvals</h2>
              <p className={styles.sectionSub}>
                New listings waiting for review before they go live
              </p>
            </div>
            <span className={styles.sectionCount}>{pendingAds.length} pending</span>
          </div>

          <div className={styles.reportsList}>
            {pendingAds.length === 0 ? (
              <p className={styles.sectionSub}>No ads waiting for approval.</p>
            ) : (
              pendingAds.map((ad) => (
                <article key={ad.id} className={styles.reportCard}>
                  <p className={styles.reportStore}>
                    <strong>{ad.name}</strong> — {formatPrice(ad.price)}
                  </p>
                  <p className={styles.reportReason}>{ad.description}</p>
                  <div className={styles.reportFooter}>
                    <span className={styles.reportReporter}>
                      {ad.vendorName} ({ad.vendorEmail}) · {ad.storeName}
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className={styles.resolveBtn}
                        onClick={() => decideAd(ad.id, true)}
                        disabled={decidingId === ad.id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className={styles.banBtn}
                        onClick={() => decideAd(ad.id, false)}
                        disabled={decidingId === ad.id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Store cards */}
        <section className={styles.storesSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Vendor stores</h2>
              <p className={styles.sectionSub}>
                Manage all stores created on the platform
              </p>
            </div>
            <span className={styles.sectionCount}>{stores.length} stores</span>
          </div>

          <div className={styles.storeGrid}>
            {stores.length === 0 ? (
              <p className={styles.sectionSub}>No vendor stores yet.</p>
            ) : (
              stores.map((store) => (
                <article key={store.vendorId} className={styles.storeCard}>
                  <div className={styles.storeTop}>
                    <div className={styles.storeAvatar}>{getStoreInitials(store.vendorName)}</div>
                    <div className={styles.storeMeta}>
                      <h3 className={styles.storeName}>{store.storeName}</h3>
                      <p className={styles.storeVendor}>{store.vendorName}</p>
                    </div>
                    <span className={styles.activeBadge}>Active</span>
                  </div>

                  <div className={styles.storeStats}>
                    <div>
                      <span className={styles.storeStatVal}>{store.productCount}</span>
                      <span className={styles.storeStatLbl}>Products</span>
                    </div>
                  </div>

                  <p className={styles.storeEmail}>{store.email}</p>
                  <p className={styles.storeDate}>Joined {formatDate(store.joinedAt)}</p>

                  <div className={styles.storeActions}>
                    <Link href={`/user?vendorId=${store.vendorId}`} className={styles.viewBtn}>
                      View store
                    </Link>
                    <button
                      type="button"
                      className={styles.banBtn}
                      onClick={() => banStore(store.vendorId)}
                      disabled={banningId === store.vendorId}
                    >
                      {banningId === store.vendorId ? "Banning..." : "Ban store"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Reports */}
        <section className={styles.reportsSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>User reports</h2>
              <p className={styles.sectionSub}>
                Complaints and feedback filed against vendors
              </p>
            </div>
            <span className={styles.sectionCount}>{reports.length} reports</span>
          </div>

          <div className={styles.reportsList}>
            {reports.length === 0 ? (
              <p className={styles.sectionSub}>No reports filed yet.</p>
            ) : (
              reports.map((report) => (
                <article key={report.id} className={styles.reportCard}>
                  <div className={styles.reportTop}>
                    <span className={styles.reportId}>#{report.id}</span>
                    <span
                      className={`${styles.reportStatus} ${
                        styles[`status_${report.status === "open" ? "pending" : "resolved"}`]
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className={styles.reportStore}>
                    Against <strong>{report.storeName}</strong>
                  </p>
                  <p className={styles.reportReason}>{report.comment}</p>
                  <div className={styles.reportFooter}>
                    <span className={styles.reportReporter}>{report.reporterEmail}</span>
                    <time className={styles.reportDate}>{formatDate(report.createdAt)}</time>
                    {report.status === "open" && (
                      <button
                        type="button"
                        className={styles.resolveBtn}
                        onClick={() => resolveReport(report.id)}
                      >
                        Mark resolved
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Marketo Admin — Platform control center</p>
      </footer>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoutes>
      <AdminPageContent />
    </ProtectedRoutes>
  );
}
