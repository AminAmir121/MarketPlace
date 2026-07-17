"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { GetUserOrders } from "../../server/server";
import styles from "./page.module.css";

type OrderStatus = "processing" | "ready_to_ship" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: string;
  productName: string;
  store: string;
  price: number;
  qty: number;
  status: OrderStatus;
  date: string;
  image: string;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  ready_to_ship: "Ready to Ship",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatPrice(price: number) {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function normalizeImageUrl(image: string) {
  if (!image) {
    return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return `${apiBaseUrl}${image.startsWith("/") ? image : `/${image}`}`;
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      const result = await GetUserOrders();

      if (result?.success) {
        const mappedOrders: Order[] = (result.data || []).map((order: any) => ({
          id: `ORD-${order.id}`,
          productName: order.productName,
          store: order.store,
          price: Number(order.price),
          qty: Number(order.qty || 1),
          status: (order.status as OrderStatus) || "processing",
          date: formatDate(order.date),
          image: normalizeImageUrl(order.image),
        }));
        setOrders(mappedOrders);
      } else {
        toast.error(result?.message || "Failed to load your orders.");
        setOrders([]);
      }

      setIsLoading(false);
    };

    loadOrders();
  }, []);

  const totalSpent = useMemo(
    () =>
      orders.filter((o) => o.status !== "cancelled").reduce(
        (sum, o) => sum + o.price * o.qty,
        0
      ),
    [orders]
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    [orders]
  );

  return (
    <ProtectedRoutes>
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Marketo
          </Link>
          <Link href="/vendor/cart" className={styles.navLink}>
            <span className={styles.linkShort}>Cart</span>
            <span className={styles.linkFull}>View cart</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Order history</span>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>
              Track everything you&apos;ve purchased — from processing to
              delivery, all in one place.
            </p>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{orders.length}</span>
              <span className={styles.statLabel}>Total orders</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{activeOrders}</span>
              <span className={styles.statLabel}>In progress</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statValue} ${styles.statSpent}`}>
                {formatPrice(totalSpent)}
              </span>
              <span className={styles.statLabel}>Total spent</span>
            </div>
          </div>
        </section>

        <section className={styles.ordersSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent orders</h2>
            <span className={styles.sectionCount}>{orders.length} items</span>
          </div>

          {isLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden>
                ⏳
              </div>
              <h2 className={styles.emptyTitle}>Loading your orders…</h2>
              <p className={styles.emptyText}>Please wait while we fetch your order history.</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon} aria-hidden>
                📦
              </div>
              <h2 className={styles.emptyTitle}>No orders yet</h2>
              <p className={styles.emptyText}>
                Once you place an order, it will show up here.
              </p>
              <Link href="/" className={styles.emptyBtn}>
                Browse products
              </Link>
            </div>
          ) : (
            <div className={styles.ordersGrid}>
              {orders.map((order) => (
                <article key={order.id} className={styles.orderCard}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={order.image}
                      alt={order.productName}
                      fill
                      className={styles.orderImage}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span
                      className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.orderId}>{order.id}</p>
                    <p className={styles.store}>{order.store}</p>
                    <h3 className={styles.productName}>{order.productName}</h3>

                    <div className={styles.metaRow}>
                      <span className={styles.price}>
                        {formatPrice(order.price * order.qty)}
                      </span>
                      <span className={styles.qty}>Qty: {order.qty}</span>
                    </div>

                    {order.qty > 1 && (
                      <p className={styles.unitPrice}>
                        {formatPrice(order.price)} each
                      </p>
                    )}

                    <div className={styles.footerRow}>
                      <span className={styles.date}>{order.date}</span>
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
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Your
          orders
        </p>
      </footer>
    </div>
    </ProtectedRoutes>
  );
}
