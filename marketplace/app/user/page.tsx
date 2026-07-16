"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { GetVendorAds } from "../server/server";
import styles from "./page.module.css";

type VendorAd = {
  id: number;
  name: string;
  price: number;
  status: "active" | "draft";
  image: string;
  views: number;
  description?: string;
  storeName?: string;
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

function buildProductDetailHref(ad: VendorAd, vendorId: string, storeName: string) {
  const payload = {
    id: ad.id,
    name: ad.name,
    store: storeName,
    price: ad.price,
    rating: 4.5,
    reviewCount: 0,
    image: ad.image,
    description: ad.description ?? "",
    ownerUserId: Number(vendorId),
  };

  const params = new URLSearchParams({
    id: String(ad.id),
    product: JSON.stringify(payload),
  });

  return `/productDetail?${params.toString()}`;
}

function StorePageContent() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendorId");

  const [vendorName, setVendorName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [ads, setAds] = useState<VendorAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadVendor = async () => {
      if (!vendorId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const result = await GetVendorAds(vendorId);

      if (result?.success) {
        setVendorName(result.data.vendorName || "Vendor");
        setStoreName(result.data.storeName || "Marketo Store");
        const mappedAds: VendorAd[] = (result.data.ads || []).map((ad: any) => ({
          id: ad.id,
          name: ad.name,
          price: Number(ad.price || 0),
          status: "active",
          views: 0,
          image: normalizeImageUrl(ad.image || ""),
          description: ad.description,
          storeName: ad.storeName,
        }));
        setAds(mappedAds);
      } else {
        setNotFound(true);
        toast.error(result?.message || "Failed to load this store.");
      }

      setIsLoading(false);
    };

    loadVendor();
  }, [vendorId]);

  const activeCount = useMemo(
    () => ads.filter((ad) => ad.status === "active").length,
    [ads]
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Loading store…</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound) {
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
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Store not found</p>
            <p className={styles.emptyText}>
              This vendor doesn&apos;t exist or has no storefront yet.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
            <div className={styles.avatar}>{vendorName.charAt(0)}</div>
            <div className={styles.userText}>
              <p className={styles.userLabel}></p>
              <h1 className={styles.userName}>{vendorName}</h1>
              <p className={styles.storeName}>{storeName}</p>
            </div>
          </div>
        </section>

        <section className={styles.toolbar}>
          <Link
            href={`/user/report?vendorId=${vendorId}&storeName=${encodeURIComponent(storeName)}`}
            className={styles.postBtn}
          >
            Report
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
                This vendor hasn&apos;t posted any products yet.
              </p>
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
                    <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                      {ad.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.adName}>{ad.name}</h3>
                    <div className={styles.metaRow}>
                      <span className={styles.price}>{formatPrice(ad.price)}</span>
                    </div>

                    <div className={styles.actions}>
                      <Link
                        href={buildProductDetailHref(ad, vendorId as string, storeName)}
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
          storefront
        </p>
      </footer>
    </div>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className={styles.page} />}>
      <StorePageContent />
    </Suspense>
  );
}
