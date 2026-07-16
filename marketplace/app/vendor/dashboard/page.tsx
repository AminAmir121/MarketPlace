"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import styles from "./page.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const VENDOR_NAME = "Alex Johnson";
const STORE_NAME = "TechVault";

type CustomerOrder = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: "pending" | "shipped";
};

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "ORD-9012",
    customer: "Sarah Miller",
    product: "Pro Wireless Headphones",
    amount: 149.99,
    date: "Jul 7, 2026",
    status: "pending",
  },
  {
    id: "ORD-9011",
    customer: "James Chen",
    product: "USB-C Fast Charger",
    amount: 29.99,
    date: "Jul 7, 2026",
    status: "pending",
  },
  {
    id: "ORD-9008",
    customer: "Emma Wilson",
    product: "Mechanical Keyboard",
    amount: 89,
    date: "Jul 6, 2026",
    status: "pending",
  },
  {
    id: "ORD-9005",
    customer: "Michael Brown",
    product: "Smart LED Desk Lamp",
    amount: 45.5,
    date: "Jul 5, 2026",
    status: "shipped",
  },
];

const WEEK_LABELS = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"];
const WEEK_SALES = [1240, 1580, 1320, 1890, 2100, 2450, 2680];

function formatPrice(price: number) {
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: price % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

function buildRingData(percent: number, color: string) {
  const value = Math.min(Math.max(percent, 0), 100);
  return {
    datasets: [
      {
        data: [value, 100 - value],
        backgroundColor: [color, "#ede9fe"],
        borderWidth: 0,
        cutout: "78%",
      },
    ],
  };
}

const ringOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

export default function DashboardPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders]
  );

  const markReadyToShip = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "shipped" as const } : o))
    );
  };

  const viewsRing = buildRingData(78, "#7c3aed");
  const salesRing = buildRingData(68, "#0d9488");
  const ratingRing = buildRingData(96, "#f59e0b");

  const weeklyChartData = {
    labels: WEEK_LABELS,
    datasets: [
      {
        label: "Sales ($)",
        data: WEEK_SALES,
        backgroundColor: WEEK_LABELS.map((_, i) =>
          activeWeek === i ? "#5b21b6" : "rgba(124, 58, 237, 0.75)"
        ),
        hoverBackgroundColor: "#5b21b6",
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const weeklyOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e1b4b",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            ` Revenue: $${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: 500 } },
      },
      y: {
        grid: { color: "rgba(124, 58, 237, 0.08)" },
        ticks: {
          color: "#64748b",
          callback: (v) => `$${v}`,
        },
      },
    },
    onClick: (_e, elements) => {
      if (elements[0]) {
        setActiveWeek(elements[0].index);
      }
    },
    onHover: (_e, elements) => {
      if (elements[0]) {
        setActiveWeek(elements[0].index);
      }
    },
  };

  return (
    <ProtectedRoutes>
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Marketo
          </Link>
          <nav className={styles.nav}>
            <Link href="/vendor/store" className={styles.navLink}>
              Store
            </Link>
            <Link href="/vendor/orders" className={styles.navLink}>
              Orders
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.topBar}>
          <div>
            <p className={styles.topLabel}>Vendor dashboard</p>
            <h1 className={styles.topTitle}>{VENDOR_NAME}</h1>
            <p className={styles.topStore}>{STORE_NAME} Store</p>
          </div>
          <span className={styles.liveBadge}>● Live analytics</span>
        </section>

        {/* Stat cards */}
        <section className={styles.statGrid}>
          <article className={`${styles.statCard} ${styles.statCardPrimary}`}>
            <p className={styles.statLabel}>Total ads</p>
            <p className={styles.statValue}>24</p>
            <p className={styles.statHint}>6 active · 18 archived</p>
          </article>
          <article className={`${styles.statCard} ${styles.statCardRevenue}`}>
            <p className={styles.statLabel}>Total revenue</p>
            <p className={styles.statValue}>$12,450</p>
            <p className={styles.statHint}>+18% vs last month</p>
          </article>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>Pending shipments</p>
            <p className={styles.statValue}>{pendingCount}</p>
            <p className={styles.statHint}>Awaiting ready to ship</p>
          </article>
        </section>

        {/* Circular graphs */}
        <section className={styles.ringsSection}>
          <h2 className={styles.sectionTitle}>Store performance</h2>
          <div className={styles.ringsGrid}>
            <div className={styles.ringCard}>
              <div className={styles.ringChart}>
                <Doughnut data={viewsRing} options={ringOptions} />
                <span className={styles.ringCenter}>78%</span>
              </div>
              <p className={styles.ringTitle}>Store views</p>
              <p className={styles.ringSub}>12,450 views this month</p>
            </div>
            <div className={styles.ringCard}>
              <div className={styles.ringChart}>
                <Doughnut data={salesRing} options={ringOptions} />
                <span className={styles.ringCenter}>+24%</span>
              </div>
              <p className={styles.ringTitle}>Sales increment</p>
              <p className={styles.ringSub}>Growth vs last month</p>
            </div>
            <div className={styles.ringCard}>
              <div className={styles.ringChart}>
                <Doughnut data={ratingRing} options={ringOptions} />
                <span className={styles.ringCenter}>4.8</span>
              </div>
              <p className={styles.ringTitle}>Store rating</p>
              <p className={styles.ringSub}>Based on 342 reviews</p>
            </div>
          </div>
        </section>

        {/* Weekly sales chart */}
        <section className={styles.chartSection}>
          <div className={styles.chartHead}>
            <div>
              <h2 className={styles.sectionTitle}>Sales per week</h2>
              <p className={styles.chartSub}>
                Hover or click bars to inspect weekly revenue
              </p>
            </div>
            {activeWeek !== null && (
              <div className={styles.weekHighlight}>
                <span className={styles.weekLabel}>{WEEK_LABELS[activeWeek]}</span>
                <span className={styles.weekValue}>
                  {formatPrice(WEEK_SALES[activeWeek])}
                </span>
              </div>
            )}
          </div>
          <div className={styles.chartWrap}>
            <Bar data={weeklyChartData} options={weeklyOptions} />
          </div>
        </section>

        {/* Customer orders */}
        <section className={styles.ordersSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Customer orders</h2>
            <span className={styles.sectionCount}>{orders.length} orders</span>
          </div>

          <div className={styles.ordersList}>
            {orders.map((order) => (
              <article
                key={order.id}
                className={`${styles.orderRow} ${
                  order.status === "shipped" ? styles.orderShipped : ""
                }`}
              >
                <div className={styles.orderInfo}>
                  <p className={styles.orderId}>{order.id}</p>
                  <h3 className={styles.orderProduct}>{order.product}</h3>
                  <p className={styles.orderCustomer}>
                    {order.customer} · {order.date}
                  </p>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderAmount}>
                    {formatPrice(order.amount)}
                  </span>
                  {order.status === "pending" ? (
                    <button
                      type="button"
                      className={styles.shipBtn}
                      onClick={() => markReadyToShip(order.id)}
                    >
                      Ready to ship
                    </button>
                  ) : (
                    <span className={styles.shippedBadge}>✓ Shipped</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Vendor
          dashboard
        </p>
      </footer>
    </div>
    </ProtectedRoutes>
  );
}
