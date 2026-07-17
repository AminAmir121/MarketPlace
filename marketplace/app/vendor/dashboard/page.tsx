"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { GetUserAds, GetVendorOrders, MarkOrderReadyToShip } from "../../server/server";
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

type CustomerOrder = {
  id: number;
  customer: string;
  product: string;
  amount: number;
  date: string;
  status: string;
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
  const [vendorName, setVendorName] = useState("Vendor");
  const [storeName, setStoreName] = useState("");
  const [totalAds, setTotalAds] = useState(0);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedName = window.localStorage.getItem("vendorName") || window.localStorage.getItem("name");
    const savedStore = window.localStorage.getItem("storeName");
    if (savedName) setVendorName(savedName);
    if (savedStore) setStoreName(savedStore);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [adsResult, ordersResult] = await Promise.all([
        GetUserAds(),
        GetVendorOrders(),
      ]);

      if (adsResult?.success) {
        setTotalAds((adsResult.data || []).length);
      }

      if (ordersResult?.success) {
        const mapped: CustomerOrder[] = (ordersResult.data || []).map((o: any) => ({
          id: o.id,
          customer: o.buyerName || o.buyerEmail || "Customer",
          product: o.productName,
          amount: Number(o.price),
          date: formatDate(o.date),
          status: o.status,
        }));
        setOrders(mapped);
      } else {
        toast.error(ordersResult?.message || "Failed to load orders.");
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === "processing").length,
    [orders]
  );

  const markReadyToShip = async (id: number) => {
    const result = await MarkOrderReadyToShip(id);

    if (result?.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "ready_to_ship" } : o))
      );
      toast.success("Order marked as ready to ship.");
    } else {
      toast.error(result?.message || "Failed to update order.");
    }
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
            <h1 className={styles.topTitle}>{vendorName}</h1>
            <p className={styles.topStore}>{storeName || "Your"} Store</p>
          </div>
          <span className={styles.liveBadge}>● Live analytics</span>
        </section>

        {/* Stat cards */}
        <section className={styles.statGrid}>
          <article className={`${styles.statCard} ${styles.statCardPrimary}`}>
            <p className={styles.statLabel}>Total ads</p>
            <p className={styles.statValue}>{totalAds}</p>
            <p className={styles.statHint}>Live listings on Marketo</p>
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

          {isLoading ? (
            <p className={styles.sectionSub}>Loading orders…</p>
          ) : orders.length === 0 ? (
            <p className={styles.sectionSub}>No orders placed against your products yet.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <article
                  key={order.id}
                  className={`${styles.orderRow} ${
                    order.status !== "processing" ? styles.orderShipped : ""
                  }`}
                >
                  <div className={styles.orderInfo}>
                    <p className={styles.orderId}>ORD-{order.id}</p>
                    <h3 className={styles.orderProduct}>{order.product}</h3>
                    <p className={styles.orderCustomer}>
                      {order.customer} · {order.date}
                    </p>
                  </div>
                  <div className={styles.orderRight}>
                    <span className={styles.orderAmount}>
                      {formatPrice(order.amount)}
                    </span>
                    {order.status === "processing" ? (
                      <button
                        type="button"
                        className={styles.shipBtn}
                        onClick={() => markReadyToShip(order.id)}
                      >
                        Ready to ship
                      </button>
                    ) : (
                      <span className={styles.shippedBadge}>✓ Ready to ship</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
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
