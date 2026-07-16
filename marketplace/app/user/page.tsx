"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./page.module.css";

type VendorAd = {
  id: number;
  name: string;
  price: number;
  status: "active" | "draft";
  image: string;
  views: number;
};

const VENDOR_NAME = "Alex Johnson";
const STORE_NAME = "TechVault";

const INITIAL_ADS: VendorAd[] = [
  {
    id: 1,
    name: "Pro Wireless Headphones",
    price: 149.99,
    status: "active",
    views: 1240,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
  },
  {
    id: 2,
    name: "USB-C Fast Charger",
    price: 29.99,
    status: "active",
    views: 856,
    image:
      "https://images.unsplash.com/photo-1591290619762-d2f8aa621ae0?w=600&q=80",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: 89,
    status: "active",
    views: 632,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
  },
  {
    id: 4,
    name: "Smart LED Desk Lamp",
    price: 45.5,
    status: "active",
    views: 421,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
  },
  {
    id: 5,
    name: "Portable SSD 1TB",
    price: 119,
    status: "draft",
    views: 0,
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80",
  },
  {
    id: 6,
    name: "Noise Cancelling Earbuds",
    price: 79.99,
    status: "active",
    views: 978,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bfad65a7849?w=600&q=80",
  },
];

function formatPrice(price: number) {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default function StorePage() {
  const [ads, setAds] = useState(INITIAL_ADS);

  const activeCount = useMemo(
    () => ads.filter((ad) => ad.status === "active").length,
    [ads]
  );

  const deleteAd = (id: number) => {
    setAds((prev) => prev.filter((ad) => ad.id !== id));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Marketo
          </Link>
          <Link href="/" className={styles.navLink}>
            <span className={styles.linkShort}>← Home</span>
            <span className={styles.linkFull}>← Back to marketplace</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.userBar}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{VENDOR_NAME.charAt(0)}</div>
            <div className={styles.userText}>
              <p className={styles.userLabel}></p>
              <h1 className={styles.userName}>{VENDOR_NAME}</h1>
              <p className={styles.storeName}>{STORE_NAME} Store</p>
            </div>
          </div>
        </section>

        <section className={styles.toolbar} >
          <Link href="/vendor/store/uploadAd" className={styles.postBtn}  >
            Report Store
          </Link>

          <div className={styles.activeBox}>
            <span className={styles.activeCount}>{activeCount}</span>
            <div className={styles.activeText}>
              <p className={styles.activeTitle}>Active ads</p>
              <p className={styles.activeSub}>
                {ads.length} total listings live on Marketo
              </p>
            </div>
          </div>
        </section>

        <section className={styles.adsSection}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>All Products</h2>
            <span className={styles.sectionCount}>{ads.length} ads</span>
          </div>

          {ads.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No ads yet</p>
              <p className={styles.emptyText}>
                Post your first product ad to start selling on Marketo.
              </p>
              <Link href="/vendor/store/uploadAd" className={styles.postBtnEmpty}>
                <PlusIcon />
                Post your first ad
              </Link>
            </div>
          ) : (
            <div className={styles.adsGrid}>
              {ads.map((ad) => (
                <article key={ad.id} className={styles.adCard}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={ad.image}
                      alt={ad.name}
                      fill
                      className={styles.adImage}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span
                      className={`${styles.statusBadge} ${
                        ad.status === "active"
                          ? styles.statusActive
                          : styles.statusDraft
                      }`}
                    >
                      {ad.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.adName}>{ad.name}</h3>
                    <div className={styles.metaRow}>
                      <span className={styles.price}>{formatPrice(ad.price)}</span>
                      <span className={styles.views}>{ad.views} views</span>
                    </div>

                    <div className={styles.actions}>
                      <Link
                        href={`/productDetail?id=${ad.id}`}
                        className={styles.editBtn}
                      >
                        Product Details
                      </Link>
                     
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
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Vendor
          portal
        </p>
      </footer>
    </div>
  );
}
