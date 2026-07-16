"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import styles from "./page.module.css";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

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

const ORDERS: Order[] = [
  {
    id: "ORD-28491",
    productName: "Pro Wireless Headphones",
    store: "TechVault",
    price: 149.99,
    qty: 1,
    status: "delivered",
    date: "Jul 2, 2026",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  {
    id: "ORD-28472",
    productName: "Premium Leather Sneakers",
    store: "UrbanStep",
    price: 89,
    qty: 1,
    status: "shipped",
    date: "Jul 4, 2026",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  },
  {
    id: "ORD-28455",
    productName: "Smart Watch Ultra",
    store: "GadgetHub",
    price: 249,
    qty: 1,
    status: "processing",
    date: "Jul 6, 2026",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
  },
  {
    id: "ORD-28401",
    productName: "Luxury Skincare Set",
    store: "Glow & Co",
    price: 64.5,
    qty: 2,
    status: "delivered",
    date: "Jun 28, 2026",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
  },
  {
    id: "ORD-28388",
    productName: "Steel Water Bottle",
    store: "EcoLife",
    price: 24.99,
    qty: 1,
    status: "cancelled",
    date: "Jun 25, 2026",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
  },
  {
    id: "ORD-28370",
    productName: "Handwoven Tote Bag",
    store: "Artisan Lane",
    price: 36,
    qty: 1,
    status: "delivered",
    date: "Jun 20, 2026",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
  },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatPrice(price: number) {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

export default function OrdersPage() {
  const totalSpent = useMemo(
    () =>
      ORDERS.filter((o) => o.status !== "cancelled").reduce(
        (sum, o) => sum + o.price * o.qty,
        0
      ),
    []
  );

  const activeOrders = useMemo(
    () => ORDERS.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length,
    []
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
              <span className={styles.statValue}>{ORDERS.length}</span>
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
            <span className={styles.sectionCount}>{ORDERS.length} items</span>
          </div>

          <div className={styles.ordersGrid}>
            {ORDERS.map((order) => (
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
                    <button type="button" className={styles.trackBtn}>
                      View details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
