"use client";

import ProtectedRoutes from "../components/ProtectedRoutes"
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AddToCart, RemoveFromCart } from "../server/server";
import styles from "./page.module.css";

type Comment = {
  id: string;
  email: string;
  text: string;
  date: string;
};

type ProductDetail = {
  id: number;
  name: string;
  store: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  comments: Comment[];
};


function formatPrice(price: number) {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function normalizeImageUrl(image: string) {
  if (!image) {
    return "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `http://localhost:5000${image.startsWith("/") ? image : `/${image}`}`;
}

function getInitials(email: string) {
  const name = email.split("@")[0] ?? "U";
  const parts = name.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={i < Math.round(rating) ? styles.starFilled : styles.star}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const productId = Number(searchParams.get("id"));
  const productParam = searchParams.get("product");

  const fallbackProduct: ProductDetail = {
    id: Number(productId) || 0,
    name: "Product details",
    store: "Vendor",
    price: 0,
    rating: 4.5,
    reviewCount: 0,
    image: "",
    description: "Product information will appear here once it is available.",
    comments: [],
  };

  const baseProduct: ProductDetail = (() => {
    if (productParam) {
      try {
        const parsed = JSON.parse(productParam);
        return {
          id: Number(parsed.id ?? productId),
          name: parsed.name ?? "Product",
          store: parsed.store ?? "Vendor",
          price: Number(parsed.price ?? 0),
          rating: Number(parsed.rating ?? 4.5),
          reviewCount: Number(parsed.reviewCount ?? 0),
          image: parsed.image ?? "",
          description: parsed.description ?? "",
          comments: [],
        } as ProductDetail;
      } catch {
        return fallbackProduct;
      }
    }

    return fallbackProduct;
  })();

  const productKey = `${baseProduct.id}-${baseProduct.name}`;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    setComments(baseProduct.comments ?? []);
    setCommentText("");
    setIsInCart(false);
  }, [productKey]);

  const handleToggleCart = async () => {
    if (isInCart) {
      const result = await RemoveFromCart(baseProduct.id);
      if (result?.success) {
        setIsInCart(false);
        toast.success("Removed from cart.");
      } else {
        toast.error(result?.message || "Failed to remove item from cart.");
      }
      return;
    }

    const result = await AddToCart(baseProduct.id);
    if (result?.success) {
      setIsInCart(true);
      toast.success(result?.added === false ? "This item is already in your cart." : "Added to cart.");
    } else {
      toast.error(result?.message || "Failed to add item to cart.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = commentText.trim();
    if (!trimmedText) return;

    const storedEmail =
      typeof window !== "undefined"
        ? window.localStorage.getItem("email") || window.localStorage.getItem("userEmail") || "member@example.com"
        : "member@example.com";

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      email: storedEmail,
      text: trimmedText,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.backLink}>
            ← Back to shop
          </Link>
          <Link href="/" className={styles.logo}>
            Marketo
          </Link>
          <Link href="/vendor/cart" className={styles.cartLink}>
            Cart
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.productSection}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <img
                src={normalizeImageUrl(baseProduct.image)}
                alt={baseProduct.name}
                className={styles.productImage}
                loading="eager"
              />
            </div>
          </div>

          <div className={styles.infoCol}>
            <p className={styles.storeTag}>{baseProduct.store}</p>
            <h1 className={styles.title}>{baseProduct.name}</h1>

            <div className={styles.ratingRow}>
              <StarRating rating={baseProduct.rating} size={20} />
              <span className={styles.ratingValue}>{baseProduct.rating}</span>
              <span className={styles.reviewCount}>
                ({baseProduct.reviewCount + comments.length} reviews)
              </span>
            </div>

            <p className={styles.price}>{formatPrice(baseProduct.price)}</p>

            <p className={styles.description}>{baseProduct.description}</p>

            <div className={styles.actions}>
              <button type="button" className={isInCart ? styles.btnSecondary : styles.btnPrimary} onClick={handleToggleCart}>
                {isInCart ? "Remove from cart" : "Add to cart"}
              </button>
              <button type="button" className={styles.btnSecondary}>
                Buy now
              </button>
            </div>

            <div className={styles.perks}>
              <span className={styles.perk}>✓ Free shipping over $50</span>
              <span className={styles.perk}>✓ 30-day returns</span>
              <span className={styles.perk}>✓ Secure checkout</span>
            </div>
          </div>
        </section>

        <section className={styles.commentsSection}>
          <div className={styles.commentsHead}>
            <h2 className={styles.commentsTitle}>Customer reviews</h2>
            <span className={styles.commentsCount}>
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </span>
          </div>

          <form className={styles.commentForm} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="comment-text">
              Your comment
            </label>
            <textarea
              id="comment-text"
              className={styles.textarea}
              placeholder="Share your experience with this product..."
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitBtn}>
              Post comment
            </button>
          </form>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.emptyComments}>
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className={styles.commentCard}>
                  <div className={styles.commentAvatar} aria-hidden>
                    {getInitials(comment.email)}
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentEmail}>{comment.email}</span>
                      <time className={styles.commentDate}>{comment.date}</time>
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Product
          details
        </p>
      </footer>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoutes>
    <Suspense fallback={<div className={styles.loading}>Loading product...</div>}>
      <ProductDetailContent />
    </Suspense>
     </ProtectedRoutes>
  );
}
