"use client";

import ProtectedRoutes from "../../../components/ProtectedRoutes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PostAd } from "../../../server/server";
import styles from "./page.module.css";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;

  const keys = ["authToken", "token", "jwt", "accessToken"];
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
};

const decodeUserIdFromToken = (token: string | null) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized);
    const parsed = JSON.parse(decoded);
    return parsed?.id || parsed?.userId || parsed?.user_id || parsed?.userid || null;
  } catch {
    return null;
  }
};

const DEFAULT_STORE = "TechVault";

export default function UploadAdPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [storeName, setStoreName] = useState(DEFAULT_STORE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [published, setPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("storeName", storeName);
    formData.append("description", description);

    const token = getStoredToken();
    const decodedUserId = decodeUserIdFromToken(token);
    const storedUserId = typeof window !== "undefined" ? window.localStorage.getItem("userId") : null;
    const finalUserId = decodedUserId || storedUserId;
    if (finalUserId) {
      formData.append("userId", String(finalUserId));
    }

    const selectedFile = fileRef.current?.files?.[0];
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const result = await PostAd(formData);

    if (result?.success) {
      toast.success("Ad published successfully!");
      router.push("/vendor/store");
    } else {
      setErrorMessage(result?.message || "Failed to publish ad.");
    }

    setIsSubmitting(false);
  };

  const handleReset = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setStoreName(DEFAULT_STORE);
    clearImage();
    setPublished(false);
    setErrorMessage("");
  };

  return (
    <ProtectedRoutes>
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Marketo
          </Link>
          <Link href="/vendor/store" className={styles.navLink}>
            <span className={styles.linkShort}>← Store</span>
            <span className={styles.linkFull}>← Back to my store</span>
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.badge}>Vendor listing</span>
          <h1 className={styles.title}>Post a new AD</h1>
          <p className={styles.subtitle}>
            Fill in your product details below and publish to your store on
            Marketo.
          </p>
        </section>

        {published ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon} aria-hidden>
              ✓
            </div>
            <h2 className={styles.successTitle}>Ad published!</h2>
            <p className={styles.successText}>
              <strong>{title}</strong> is now live on {storeName} Store.
            </p>
            <div className={styles.successActions}>
              <Link href="/vendor/store" className={styles.successBtn}>
                View my store
              </Link>
              <button
                type="button"
                className={styles.successBtnSecondary}
                onClick={handleReset}
              >
                Post another ad
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.formMain}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="title">
                    Product title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Pro Wireless Headphones"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="price">
                      Price ($)
                    </label>
                    <input
                      id="price"
                      type="number"
                      className={styles.input}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="store">
                      Store name
                    </label>
                    <input
                      id="store"
                      type="text"
                      className={styles.input}
                      placeholder="Your store name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    placeholder="Describe your product — features, condition, what's included..."
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formSide}>
                <div className={styles.field}>
                  <span className={styles.label}>Product image</span>
                  <div
                    className={`${styles.uploadZone} ${
                      imagePreview ? styles.uploadZoneFilled : ""
                    }`}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload product image"
                  >
                    {imagePreview ? (
                      <div className={styles.previewWrap}>
                        <Image
                          src={imagePreview}
                          alt="Product preview"
                          fill
                          className={styles.previewImage}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <span className={styles.uploadIcon}>📷</span>
                        <p className={styles.uploadText}>
                          Click to upload image
                        </p>
                        <p className={styles.uploadHint}>PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleImageChange}
                    required
                  />
                  {imageName && (
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>{imageName}</span>
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={clearImage}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {errorMessage ? (
                  <div className={styles.tips}>
                    <p className={styles.tipsTitle}>Publishing error</p>
                    <p className={styles.uploadHint}>{errorMessage}</p>
                  </div>
                ) : (
                  <div className={styles.tips}>
                    <p className={styles.tipsTitle}>Tips for a great listing</p>
                    <ul className={styles.tipsList}>
                      <li>Use a clear, well-lit product photo</li>
                      <li>Write an honest, detailed description</li>
                      <li>Set a competitive price</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formFooter}>
              <Link href="/vendor/store" className={styles.cancelBtn}>
                Cancel
              </Link>
              <button type="submit" className={styles.publishBtn} disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : "Publish ad"}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Post ad
        </p>
      </footer>
    </div>
    </ProtectedRoutes>
  );
}
