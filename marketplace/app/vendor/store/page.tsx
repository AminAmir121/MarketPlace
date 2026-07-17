"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DeleteAd, GetUserAds, UpdateStoreName } from "../../server/server";
import styles from "./page.module.css";

type VendorAd = {
  id: number;
  name: string;
  price: number;
  status: "active" | "draft";
  image: string;
  views: number;
  storeName?: string;
  description?: string;
};

const DEFAULT_STORE_NAME = "TechVault";

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
  const [ads, setAds] = useState<VendorAd[]>([]);
  const [vendorName, setVendorName] = useState("Vendor");
  const [storeName, setStoreName] = useState(DEFAULT_STORE_NAME);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftStoreName, setDraftStoreName] = useState(DEFAULT_STORE_NAME);
  const [isSavingStoreName, setIsSavingStoreName] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      const result = await GetUserAds();
      if (result?.success) {
        setAds(
          (result.data || []).map((ad: any) => ({
            id: ad.id,
            name: ad.name,
            price: Number(ad.price || 0),
            status: "active" as const,
            views: ad.views || 0,
            image: (() => {
              const rawImage = ad.image || "";
              if (!rawImage) {
                return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80";
              }
              if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
                return rawImage;
              }
              const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
              return `${apiBaseUrl}${rawImage.startsWith("/") ? rawImage : `/${rawImage}`}`;
            })(),
            storeName: ad.storeName,
            description: ad.description,
          }))
        );
      }
    };

    loadAds();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedName = window.localStorage.getItem("vendorName") || window.localStorage.getItem("name") || window.localStorage.getItem("userName");
    const savedStore = window.localStorage.getItem("storeName") || window.localStorage.getItem("store");
    if (savedName) {
      setVendorName(savedName);
    }
    if (savedStore) {
      setStoreName(savedStore);
      setDraftStoreName(savedStore);
    }
  }, []);

  const activeCount = useMemo(
    () => ads.filter((ad) => ad.status === "active").length,
    [ads]
  );

  const deleteAd = async (id: number) => {
    const result = await DeleteAd(id);

    if (result?.success) {
      setAds((prev) => prev.filter((ad) => ad.id !== id));
      toast.success("Ad deleted successfully.");
    } else {
      toast.error(result?.message || "Failed to delete ad.");
    }
  };

  const handleOpenStoreEditor = () => {
    setDraftStoreName(storeName);
    setIsEditOpen(true);
  };

  const handleSaveStoreName = async () => {
    const trimmed = draftStoreName.trim();
    if (!trimmed) {
      toast.error("Store name cannot be empty.");
      return;
    }

    setIsSavingStoreName(true);
    const userId = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
    const result = await UpdateStoreName(userId || "", trimmed);

    if (result?.success) {
      setStoreName(trimmed);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("storeName", trimmed);
      }
      toast.success("Store name updated.");
      setIsEditOpen(false);
    } else {
      toast.error("Failed to save store name.");
    }

    setIsSavingStoreName(false);
  };

  return (
    <ProtectedRoutes>
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
              <p className={styles.userLabel}>My Store</p>
              <h1 className={styles.userName}>{vendorName}</h1>
              <div className={styles.storeNameRow}>
                <p className={styles.storeName}>{storeName} Store</p>
                <button type="button" className={styles.editStoreBtn} onClick={handleOpenStoreEditor}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.toolbar}>
          <div className={styles.actionGroup}>
            <Link href="/vendor/store/uploadAd" className={styles.postBtn}>
              <PlusIcon />
              Post new ad
            </Link>

            <Link href="/vendor/dashboard" className={styles.dashboardBtn}>
              Dashboard
            </Link>
          </div>

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
            <h2 className={styles.sectionTitle}>Your product ads</h2>
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
                    <img
                      src={ad.image}
                      alt={ad.name}
                      className={styles.adImage}
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
                    <p className={styles.storeName}>{ad.storeName || storeName}</p>
                    <div className={styles.metaRow}>
                      <span className={styles.price}>{formatPrice(ad.price)}</span>
                      <span className={styles.views}>{ad.views} views</span>
                    </div>

                    <div className={styles.actions}>
                      <Link
                        href={`/vendor/store/editAd?id=${ad.id}&title=${encodeURIComponent(ad.name)}&price=${ad.price}&storeName=${encodeURIComponent(ad.storeName || storeName)}&description=${encodeURIComponent(ad.description || "")}&image=${encodeURIComponent(ad.image)}`}
                        className={styles.editBtn}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => deleteAd(ad.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {isEditOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit store name</h3>
            <input
              className={styles.modalInput}
              value={draftStoreName}
              onChange={(e) => setDraftStoreName(e.target.value)}
              placeholder="Enter your store name"
            />
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalCancelBtn} onClick={() => setIsEditOpen(false)}>
                Cancel
              </button>
              <button type="button" className={styles.modalSaveBtn} onClick={handleSaveStoreName} disabled={isSavingStoreName}>
                {isSavingStoreName ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Vendor
          portal
        </p>
      </footer>
    </div>
    </ProtectedRoutes>
  );
}
