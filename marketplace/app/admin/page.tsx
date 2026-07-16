"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

type Store = {
  id: string;
  name: string;
  vendor: string;
  email: string;
  products: number;
  revenue: number;
  rating: number;
  status: "active" | "banned";
  createdAt: string;
};

type Report = {
  id: string;
  reporter: string;
  targetStore: string;
  reason: string;
  date: string;
  status: "pending" | "reviewed" | "resolved";
  severity: "low" | "medium" | "high";
};

const INITIAL_STORES: Store[] = [
  {
    id: "st-001",
    name: "TechVault",
    vendor: "Alex Johnson",
    email: "alex@techvault.com",
    products: 24,
    revenue: 12450,
    rating: 4.8,
    status: "active",
    createdAt: "Mar 12, 2026",
  },
  {
    id: "st-002",
    name: "UrbanStep",
    vendor: "Maria Garcia",
    email: "maria@urbanstep.io",
    products: 18,
    revenue: 8920,
    rating: 4.6,
    status: "active",
    createdAt: "Apr 3, 2026",
  },
  {
    id: "st-003",
    name: "Glow & Co",
    vendor: "Priya Sharma",
    email: "priya@glowco.com",
    products: 31,
    revenue: 15680,
    rating: 4.9,
    status: "active",
    createdAt: "Feb 28, 2026",
  },
  {
    id: "st-004",
    name: "SoundWave",
    vendor: "David Kim",
    email: "david@soundwave.net",
    products: 12,
    revenue: 5340,
    rating: 4.3,
    status: "active",
    createdAt: "May 18, 2026",
  },
  {
    id: "st-005",
    name: "FitFlex",
    vendor: "Jordan Lee",
    email: "jordan@fitflex.app",
    products: 22,
    revenue: 9870,
    rating: 4.5,
    status: "active",
    createdAt: "Jun 1, 2026",
  },
  {
    id: "st-006",
    name: "BrewCraft",
    vendor: "Sam Wilson",
    email: "sam@brewcraft.co",
    products: 9,
    revenue: 3210,
    rating: 4.7,
    status: "active",
    createdAt: "Jun 22, 2026",
  },
];

const INITIAL_REPORTS: Report[] = [
  {
    id: "RPT-4421",
    reporter: "emma.wilson@email.com",
    targetStore: "SoundWave",
    reason: "Product not as described — speaker arrived damaged.",
    date: "Jul 6, 2026",
    status: "pending",
    severity: "high",
  },
  {
    id: "RPT-4418",
    reporter: "james.chen@email.com",
    targetStore: "UrbanStep",
    reason: "Delayed shipping beyond promised delivery window.",
    date: "Jul 5, 2026",
    status: "reviewed",
    severity: "medium",
  },
  {
    id: "RPT-4402",
    reporter: "sarah.miller@email.com",
    targetStore: "TechVault",
    reason: "Excellent support — reporting positive experience for records.",
    date: "Jul 4, 2026",
    status: "resolved",
    severity: "low",
  },
  {
    id: "RPT-4395",
    reporter: "michael.brown@email.com",
    targetStore: "FitFlex",
    reason: "Suspected counterfeit yoga mat received.",
    date: "Jul 3, 2026",
    status: "pending",
    severity: "high",
  },
];

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

export default function AdminPage() {
  const [stores, setStores] = useState(INITIAL_STORES);
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const activeStores = useMemo(
    () => stores.filter((s) => s.status === "active"),
    [stores]
  );
  const uniqueVendors = useMemo(() => new Set(stores.map((s) => s.vendor)).size, [stores]);
  const totalRevenue = useMemo(
    () => stores.reduce((sum, s) => sum + s.revenue, 0),
    [stores]
  );
  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === "pending").length,
    [reports]
  );

  const banStore = (id: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "banned" as const } : s))
    );
  };

  const resolveReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" as const } : r))
    );
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
            <p className={styles.statValue}>{activeStores.length}</p>
            <p className={styles.statSub}>
              {stores.length} created · {stores.filter((s) => s.status === "banned").length} banned
            </p>
          </article>
          <article className={`${styles.statCard} ${styles.statViolet}`}>
            <div className={styles.statIcon}>👤</div>
            <p className={styles.statLabel}>Total vendors</p>
            <p className={styles.statValue}>{uniqueVendors}</p>
            <p className={styles.statSub}>Active marketplace sellers</p>
          </article>
          <article className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statIcon}>💰</div>
            <p className={styles.statLabel}>Total revenue</p>
            <p className={styles.statValue}>{formatPrice(totalRevenue)}</p>
            <p className={styles.statSub}>+24% growth this quarter</p>
          </article>
          <article className={`${styles.statCard} ${styles.statRose}`}>
            <div className={styles.statIcon}>⚠️</div>
            <p className={styles.statLabel}>Open reports</p>
            <p className={styles.statValue}>{pendingReports}</p>
            <p className={styles.statSub}>Awaiting admin review</p>
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
            {stores.map((store) => (
              <article
                key={store.id}
                className={`${styles.storeCard} ${
                  store.status === "banned" ? styles.storeBanned : ""
                }`}
              >
                <div className={styles.storeTop}>
                  <div className={styles.storeAvatar}>{getStoreInitials(store.name)}</div>
                  <div className={styles.storeMeta}>
                    <h3 className={styles.storeName}>{store.name}</h3>
                    <p className={styles.storeVendor}>{store.vendor}</p>
                  </div>
                  {store.status === "banned" ? (
                    <span className={styles.bannedBadge}>Banned</span>
                  ) : (
                    <span className={styles.activeBadge}>Active</span>
                  )}
                </div>

                <div className={styles.storeStats}>
                  <div>
                    <span className={styles.storeStatVal}>{store.products}</span>
                    <span className={styles.storeStatLbl}>Products</span>
                  </div>
                  <div>
                    <span className={styles.storeStatVal}>{formatPrice(store.revenue)}</span>
                    <span className={styles.storeStatLbl}>Revenue</span>
                  </div>
                  <div>
                    <span className={styles.storeStatVal}>★ {store.rating}</span>
                    <span className={styles.storeStatLbl}>Rating</span>
                  </div>
                </div>

                <p className={styles.storeEmail}>{store.email}</p>
                <p className={styles.storeDate}>Joined {store.createdAt}</p>

                <div className={styles.storeActions}>
                  <Link
                    href="/vendor/store"
                    className={styles.viewBtn}
                  >
                    View store
                  </Link>
                  {store.status === "active" ? (
                    <button
                      type="button"
                      className={styles.banBtn}
                      onClick={() => banStore(store.id)}
                    >
                      Ban store
                    </button>
                  ) : (
                    <span className={styles.bannedLabel}>Store banned</span>
                  )}
                </div>
              </article>
            ))}
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
            {reports.map((report) => (
              <article key={report.id} className={styles.reportCard}>
                <div className={styles.reportTop}>
                  <span className={styles.reportId}>{report.id}</span>
                  <span
                    className={`${styles.severity} ${styles[`sev_${report.severity}`]}`}
                  >
                    {report.severity}
                  </span>
                  <span
                    className={`${styles.reportStatus} ${styles[`status_${report.status}`]}`}
                  >
                    {report.status}
                  </span>
                </div>
                <p className={styles.reportStore}>
                  Against <strong>{report.targetStore}</strong>
                </p>
                <p className={styles.reportReason}>{report.reason}</p>
                <div className={styles.reportFooter}>
                  <span className={styles.reportReporter}>{report.reporter}</span>
                  <time className={styles.reportDate}>{report.date}</time>
                  {report.status === "pending" && (
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
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Marketo Admin — Platform control center</p>
      </footer>
    </div>
  );
}
