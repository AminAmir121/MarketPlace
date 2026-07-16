"use client";

import ProtectedRoutes from "../../../components/ProtectedRoutes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { EditAd as EditAdRequest } from "../../../server/server";
import styles from "./page.module.css";

type EditableAd = {
  id: number;
  name: string;
  price: number;
  storeName: string;
  description: string;
  status: "active" | "draft";
  views: number;
  image: string;
};

function EditAdContent() {
  const searchParams = useSearchParams();
  const adId = Number(searchParams.get("id")) || 0;
  const initialTitle = searchParams.get("title") || "";
  const initialPrice = searchParams.get("price") || "";
  const initialStoreName = searchParams.get("storeName") || "";
  const initialDescription = searchParams.get("description") || "";
  const initialImage = searchParams.get("image") || "";

  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialTitle);
  const [price, setPrice] = useState(initialPrice);
  const [description, setDescription] = useState(initialDescription);
  const [storeName, setStoreName] = useState(initialStoreName);
  const [imagePreview, setImagePreview] = useState<string>(initialImage || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80");
  const [imageName, setImageName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setPrice(initialPrice);
    setDescription(initialDescription);
    setStoreName(initialStoreName);
    setImagePreview(initialImage || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80");
    setImageName("");
    setSelectedFile(null);
    setSaved(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [initialTitle, initialPrice, initialStoreName, initialDescription, initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    setImagePreview(initialImage || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80");
    setImageName("");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adId) {
      toast.error("Missing ad id.");
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append("adId", String(adId));
    formData.append("title", title.trim());
    formData.append("price", price);
    formData.append("storeName", storeName.trim());
    formData.append("description", description.trim());

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const result = await EditAdRequest(formData);

    if (result?.success) {
      setSaved(true);
      toast.success("Ad updated successfully.");
    } else {
      toast.error(result?.message || "Failed to update ad.");
    }

    setIsSaving(false);
  };

  return (
    
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
          <span className={styles.badge}>Edit listing</span>
          <h1 className={styles.title}>Edit ad</h1>
          <p className={styles.subtitle}>
            Update your product details below. Changes will reflect on your
            store once saved.
          </p>
          <div className={styles.adMeta}>
            <span className={styles.adId}>Ad #{adId || "new"}</span>
            <span className={styles.statusTag}>
              Active
            </span>
          </div>
        </section>

        {saved ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon} aria-hidden>
              ✓
            </div>
            <h2 className={styles.successTitle}>Ad updated!</h2>
            <p className={styles.successText}>
              <strong>{title}</strong> has been saved successfully.
            </p>
            <div className={styles.successActions}>
              <Link href="/vendor/store" className={styles.successBtn}>
                Back to store
              </Link>
              <button
                type="button"
                className={styles.successBtnSecondary}
                onClick={() => setSaved(false)}
              >
                Continue editing
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
                    placeholder="Describe your product..."
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
                    className={`${styles.uploadZone} ${styles.uploadZoneFilled}`}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Change product image"
                  >
                    <div className={styles.previewWrap}>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className={styles.previewImage}
                      />
                      <span className={styles.changeOverlay}>Click to change</span>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleImageChange}
                  />
                  {(imageName || imagePreview !== (initialImage || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80")) && (
                    <div className={styles.fileMeta}>
                      <span className={styles.fileName}>
                        {imageName || "Image updated"}
                      </span>
                      <button
                        type="button"
                        className={styles.removeImage}
                        onClick={resetImage}
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.tips}>
                  <p className={styles.tipsTitle}>Editing checklist</p>
                  <ul className={styles.tipsList}>
                    <li>Double-check price and title spelling</li>
                    <li>Keep description accurate and up to date</li>
                    <li>Replace image if product appearance changed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <Link href="/vendor/store" className={styles.cancelBtn}>
                Cancel
              </Link>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Edit ad
        </p>
      </footer>
    </div>
  );
}

export default function EditAdPage() {
  return (
    <ProtectedRoutes>
    <Suspense fallback={<div className={styles.loading}>Loading ad...</div>}>
      <EditAdContent />
    </Suspense>
    </ProtectedRoutes>
  );
}
