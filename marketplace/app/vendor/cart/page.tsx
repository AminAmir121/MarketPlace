"use client";

import ProtectedRoutes from "../../components/ProtectedRoutes";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { GetUserCart, RemoveFromCart, PlaceOrder } from "../../server/server";
import styles from "./page.module.css";

export type CartItem = {
  id: number;
  name: string;
  store: string;
  price: number;
  rating: number;
  qty: number;
  image: string;
  description?: string;
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

  return `http://localhost:5000${image.startsWith("/") ? image : `/${image}`}`;
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCartItems = async () => {
    setIsLoading(true);
    const result = await GetUserCart();

    if (result?.success) {
      const mappedItems = (result.data || []).map((item: any) => ({
        ...item,
        qty: Number(item.qty || 1),
        rating: Number(item.rating || 4.5),
        image: normalizeImageUrl(item.image || ""),
      }));
      setCartItems(mappedItems);
    } else {
      toast.error(result?.message || "Failed to load your cart.");
      setCartItems([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadCartItems();
  }, []);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const removeFromCart = async (id: number) => {
    const result = await RemoveFromCart(id);

    if (result?.success) {
      toast.success("Removed from cart.");
      await loadCartItems();
    } else {
      toast.error(result?.message || "Failed to remove item from cart.");
    }
  };

  const placeOrder = async (id: number) => {
    const result = await PlaceOrder(id);

    if (result?.success) {
      toast.success("Order placed successfully!");
      await RemoveFromCart(id);
      await loadCartItems();
    } else {
      toast.error(result?.message || "Failed to place order.");
    }
  };

  return (
  <ProtectedRoutes>
      
        <div className={styles.page}>
          <header className={styles.header}>
            <div className={styles.headerInner}>
              <Link href="/" className={styles.logo}>
                Marketo
              </Link>
              <Link href="/" className={styles.continueLink}>
                <span className={styles.linkShort}>← Shop</span>
                <span className={styles.linkFull}>← Continue shopping</span>
              </Link>
            </div>
          </header>

          <main className={styles.main}>
            <section className={styles.hero}>
              <div className={styles.heroContent}>
                <span className={styles.badge}>Your bag</span>
                <h1 className={styles.title}>My Cart</h1>
                <p className={styles.subtitle}>
                  Review your picks, remove items you don&apos;t need, and place
                  orders from trusted vendors — all in one place.
                </p>
              </div>

              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Items</span>
                  <span className={styles.summaryValue}>{totalItems}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal</span>
                  <span className={styles.summaryTotal}>{formatPrice(subtotal)}</span>
                </div>
                <p className={styles.summaryNote}>Shipping calculated at checkout</p>
              </div>
            </section>

            {isLoading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden>
                  ⏳
                </div>
                <h2 className={styles.emptyTitle}>Loading your cart…</h2>
                <p className={styles.emptyText}>Please wait while we fetch your saved items.</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon} aria-hidden>
                  🛒
                </div>
                <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                <p className={styles.emptyText}>
                  Looks like you haven&apos;t added anything yet. Explore the
                  marketplace and find something you love.
                </p>
                <Link href="/" className={styles.emptyBtn}>
                  Browse products
                </Link>
              </div>
            ) : (
              <section className={styles.gridSection}>
                <div className={styles.gridHead}>
                  <h2 className={styles.gridTitle}>Cart items</h2>
                  <span className={styles.gridCount}>
                    {cartItems.length} products · {totalItems} units
                  </span>
                </div>

                <div className={styles.cartGrid}>
                  {cartItems.map((item) => (
                    <article key={item.id} className={styles.cartCard}>
                      <div className={styles.imageWrap}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.cardImage}
                        />
                        <span className={styles.qtyBadge}>×{item.qty}</span>
                      </div>

                      <div className={styles.cardBody}>
                        <p className={styles.store}>{item.store}</p>
                        <h3 className={styles.productName}>{item.name}</h3>

                        <div className={styles.metaRow}>
                          <span className={styles.price}>
                            {formatPrice(item.price * item.qty)}
                          </span>
                          <span className={styles.rating}>
                            <StarIcon />
                            {item.rating}
                          </span>
                        </div>

                        {item.qty > 1 && (
                          <p className={styles.unitPrice}>
                            {formatPrice(item.price)} each
                          </p>
                        )}

                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove from cart
                          </button>
                          <button
                            type="button"
                            className={styles.orderBtn}
                            onClick={() => placeOrder(item.id)}
                          >
                            Place order
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </main>

          <footer className={styles.footer}>
            <p>
              © 2026 <span className={styles.footerBrand}>Marketo</span> — Happy
              shopping
            </p>
          </footer>
        </div>
      </ProtectedRoutes>
    );
  }
