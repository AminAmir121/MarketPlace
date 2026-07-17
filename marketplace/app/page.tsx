"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AddToCart, GetAllAds, RemoveFromCart } from "./server/server";
import styles from "./page.module.css";

type Product = {
  id: number;
  name: string;
  store: string;
  price: number;
  rating: number;
  image: string;
  description?: string;
  reviewCount?: number;
  ownerUserId?: number;
};

type Deal = Product & {
  originalPrice: number;
  discount: number;
};

const HOT_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Pro Wireless Headphones",
    store: "TechVault",
    price: 149.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=80",
  },
  {
    id: 2,
    name: "Premium Leather Sneakers",
    store: "UrbanStep",
    price: 89,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80",
  },
  {
    id: 3,
    name: "Smart Watch Ultra",
    store: "GadgetHub",
    price: 249,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80",
  },
  {
    id: 4,
    name: "Luxury Skincare Set",
    store: "Glow & Co",
    price: 64.5,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1400&q=80",
  },
];

const DEAL_PRODUCTS: Deal[] = [
  {
    id: 101,
    name: "Running Shoes — Flash Sale",
    store: "FitFlex",
    price: 59.99,
    originalPrice: 99.99,
    discount: 40,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
  },
  {
    id: 102,
    name: "Designer Sunglasses",
    store: "SunStyle",
    price: 45,
    originalPrice: 90,
    discount: 50,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
  },
  {
    id: 103,
    name: "Bluetooth Speaker Mini",
    store: "SoundWave",
    price: 29.99,
    originalPrice: 49.99,
    discount: 40,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
  },
  {
    id: 104,
    name: "Ceramic Coffee Mug Set",
    store: "BrewCraft",
    price: 18,
    originalPrice: 30,
    discount: 40,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  },
  {
    id: 105,
    name: "Handbag — Limited Offer",
    store: "Artisan Lane",
    price: 72,
    originalPrice: 120,
    discount: 40,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80",
  },
  {
    id: 106,
    name: "Fitness Tracker Band",
    store: "GadgetHub",
    price: 39.99,
    originalPrice: 79.99,
    discount: 50,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=80",
  },
];


function formatPrice(price: number) {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function buildProductDetailHref(product: Product | Deal) {
  const payload = {
    id: product.id,
    name: product.name,
    store: product.store,
    price: product.price,
    rating: product.rating,
    reviewCount: product.reviewCount ?? 0,
    image: product.image,
    description: product.description ?? "",
    ownerUserId: product.ownerUserId ?? null,
  };

  const params = new URLSearchParams({
    id: String(product.id),
    product: JSON.stringify(payload),
  });

  return `/productDetail?${params.toString()}`;
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

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={i < Math.round(rating) ? styles.starFilled : styles.star}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className={styles.ratingNum}>{rating}</span>
    </div>
  );
}

function decodeJwt(token: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch (e) {
    return null;
  }
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9l1-6h16l1 6" />
      <path d="M21 9v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9" />
      <path d="M7 13h10v6H7z" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1" />
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M16 3v4" />
    </svg>
  );
}

function AdminMenu({ user, onClose, onLogout }: { user: any; onClose: () => void; onLogout: () => void }) {
  return (
    <div className={styles.adminMenu} role="dialog" aria-label="Admin menu">
      <div className={styles.adminMenuHeader}>
        <div className={styles.adminAvatarLarge}>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
        <div style={{ flex: 1 }}>
          <div className={styles.adminMenuName}>{user?.name ?? "User"}</div>
          {user?.email && <div className={styles.adminMenuEmail}>{user.email}</div>}
        </div>
      </div>

      <div className={styles.adminMenuDivider} />

      <button onClick={onClose} className={styles.adminMenuClose}>Close</button>

      <nav className={styles.adminMenuNav}>
        <a href="/vendor/cart" onClick={onClose} className={styles.adminMenuItem}>
          <CartIcon /> <span>My Cart</span>
        </a>
        <a href="/vendor/store" onClick={onClose} className={styles.adminMenuItem}>
          <StoreIcon /> <span>My Store</span>
        </a>
        <a href="/vendor/orders" onClick={onClose} className={styles.adminMenuItem}>
          <OrdersIcon /> <span>My Orders</span>
        </a>
        <a href="/account/my-reports" onClick={onClose} className={styles.adminMenuItem}>
          <OrdersIcon /> <span>My Reports</span>
        </a>
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Signed in</div>
        <button
          type="button"
          onClick={onLogout}
          className={styles.adminMenuItem}
          style={{ justifyContent: "center", background: "rgba(239, 68, 68, 0.08)", color: "#b91c1c", border: "1px solid rgba(239, 68, 68, 0.16)" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function DealCard({
  deal,
  onToggleCart,
  isInCart,
}: {
  deal: Deal;
  onToggleCart: (product: Product) => void;
  isInCart: boolean;
}) {
  return (
    <article className={styles.dealCard}>
      <Link href={buildProductDetailHref(deal)} className={styles.cardLink}>
      <div className={styles.dealCardInner}>
        <div className={styles.dealImageWrap}>
          <img
            src={normalizeImageUrl(deal.image)}
            alt={deal.name}
            className={styles.dealImage}
            loading="lazy"
          />
          <span className={styles.dealRibbon}>Sale</span>
          <span className={styles.dealOff}>-{deal.discount}%</span>
        </div>
        <div className={styles.dealBody}>
          <p className={styles.dealName}>{deal.name}</p>
          <div className={styles.dealPrices}>
            <span className={styles.dealPriceNew}>{formatPrice(deal.price)}</span>
            <span className={styles.dealPriceOld}>
              {formatPrice(deal.originalPrice)}
            </span>
          </div>
        </div>
      </div>
      </Link>
      <button
        type="button"
        className={`${styles.addToCartBtn} ${isInCart ? styles.addToCartAdded : ""}`}
        onClick={() => onToggleCart(deal)}
      >
        {isInCart ? "Remove from cart" : "Add to cart"}
      </button>
    </article>
  );
}

function ProductCard({
  product,
  onToggleCart,
  isInCart,
}: {
  product: Product;
  onToggleCart: (product: Product) => void;
  isInCart: boolean;
}) {
  return (
    <article className={styles.productCard}>
      <Link href={buildProductDetailHref(product)} className={styles.cardLink}>
      <div className={styles.cardImageWrap}>
        <img
          src={normalizeImageUrl(product.image)}
          alt={product.name}
          className={styles.cardImage}
          loading="lazy"
        />
        <span className={styles.cardShine} aria-hidden />
        <button
          type="button"
          className={styles.favBtn}
          aria-label="Add to favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <HeartIcon />
        </button>
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardStore}>{product.store}</p>
        <h3 className={styles.cardName}>{product.name}</h3>
        <div className={styles.cardFooter}>
          <span className={styles.cardPrice}>{formatPrice(product.price)}</span>
          <StarRating rating={product.rating} />
        </div>
      </div>
      </Link>
      <button
        type="button"
        className={`${styles.addToCartBtn} ${isInCart ? styles.addToCartAdded : ""}`}
        onClick={() => onToggleCart(product)}
      >
        {isInCart ? "Remove from cart" : "Add to cart"}
      </button>
    </article>
  );
}

export default function App() {
  const [hotIndex, setHotIndex] = useState(0);
  const [dealIndex, setDealIndex] = useState(0);
  const [dealsPerView, setDealsPerView] = useState(1);
  const [cartIds, setCartIds] = useState<Set<number>>(new Set());
  const [user, setUser] = useState<any>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const adminBtnRef = useRef<HTMLButtonElement | null>(null);

  const isLoggedIn = Boolean(user);

  const handleToggleCart = useCallback(async (product: Product) => {
    if (cartIds.has(product.id)) {
      const result = await RemoveFromCart(product.id);
      if (result?.success) {
        setCartIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
        toast.success("Removed from cart.");
      } else {
        toast.error(result?.message || "Failed to remove item from cart.");
      }
      return;
    }

    const result = await AddToCart(product.id);
    if (result?.success) {
      setCartIds((prev) => {
        const next = new Set(prev);
        next.add(product.id);
        return next;
      });
      toast.success(result?.added === false ? "This item is already in your cart." : "Added to cart.");
    } else {
      toast.error(result?.message || "Failed to add item to cart.");
    }
  }, [cartIds]);

  const nextHot = useCallback(() => {
    setHotIndex((i) => (i + 1) % HOT_PRODUCTS.length);
  }, []);

  const prevHot = useCallback(() => {
    setHotIndex((i) => (i - 1 + HOT_PRODUCTS.length) % HOT_PRODUCTS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextHot, 6000);
    return () => clearInterval(timer);
  }, [nextHot]);

  useEffect(() => {
    // read token from localStorage (common keys: token, authToken)
    const t = typeof window !== "undefined" ? (localStorage.getItem("authToken") ?? localStorage.getItem("token")) : null;
    if (t) {
      const p = decodeJwt(t);
      if (p) {
        setUser({ name: p.name ?? p.fullname ?? p.username ?? "User", email: p.email ?? p?.sub ?? "" });
      }
    }
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!showAdminMenu) return;
      const btn = adminBtnRef.current;
      const target = e.target as Node | null;
      if (btn && target && !btn.contains(target as Node)) {
        // click outside admin button will close menu
        setShowAdminMenu(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAdminMenu(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showAdminMenu]);

  useEffect(() => {
    const updatePerView = () => {
      if (window.innerWidth >= 1024) setDealsPerView(3);
      else if (window.innerWidth >= 640) setDealsPerView(2);
      else setDealsPerView(1);
    };
    updatePerView();
    window.addEventListener("resize", updatePerView);
    return () => window.removeEventListener("resize", updatePerView);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      const result = await GetAllAds();

      if (result?.success) {
        const mapped = (result.data || []).map((ad: any) => ({
          id: ad.id,
          name: ad.name,
          store: ad.storeName || "Marketo Vendor",
          price: Number(ad.price || 0),
          rating: 4.5,
          image: normalizeImageUrl(ad.image || ""),
          description: ad.description,
          ownerUserId: ad.userId,
        }));
        setAllProducts(mapped);
      } else {
        toast.error(result?.message || "Failed to fetch products.");
      }

      setIsLoadingProducts(false);
    };

    loadProducts();
  }, []);

  const maxDealIndex = Math.max(0, DEAL_PRODUCTS.length - dealsPerView);

  useEffect(() => {
    if (dealIndex > maxDealIndex) setDealIndex(maxDealIndex);
  }, [dealIndex, maxDealIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDealIndex((i) => (i >= maxDealIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [maxDealIndex]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      setUser(null);
      setShowAdminMenu(false);
    }
  };

  const nextDeal = () => setDealIndex((i) => (i >= maxDealIndex ? 0 : i + 1));
  const prevDeal = () => setDealIndex((i) => (i <= 0 ? maxDealIndex : i - 1));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            Marketo
          </a>

          <div className={styles.searchWrap}>
            <SearchIcon />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search products, stores, brands..."
              aria-label="Search products"
              
            />
          </div>

          <div className={styles.authArea}>
            {isLoggedIn ? (
              <div className={styles.adminBtnWrap}>
                <button
                  ref={adminBtnRef}
                  type="button"
                  aria-label="Open account menu"
                  className={styles.adminCircleBtn}
                  onClick={() => setShowAdminMenu((s) => !s)}
                >
                  <span className={styles.adminCircleAvatar} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span style={{ display: "none" }}>Account</span>
                </button>

                {showAdminMenu && (
                  <div>
                    <div className={styles.adminMenuBackdrop} onClick={() => setShowAdminMenu(false)} />
                    <div className={styles.adminMenuWrapper}>
                      <AdminMenu user={user} onClose={() => setShowAdminMenu(false)} onLogout={handleLogout} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className={styles.btnPrimary}>
                <Link href="/account">Login</Link>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hot selling — crossfade + ken burns */}
        <section className={styles.hotSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Hot Selling</h2>
              <p className={styles.sectionSub}>Top picks flying off the shelves</p>
            </div>
            <span className={`${styles.pill} ${styles.pillHot}`}>🔥 Trending</span>
          </div>

          <div className={styles.hotSlider}>
            {HOT_PRODUCTS.map((product, index) => (
              <div
                key={product.id}
                className={`${styles.hotSlide} ${index === hotIndex ? styles.hotSlideActive : ""}`}
              >
                <img
                  src={normalizeImageUrl(product.image)}
                  alt={product.name}
                  className={styles.hotSlideImg}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className={styles.hotOverlay} />
                <div className={styles.hotContent}>
                  <span className={styles.hotBadge}>Hot Deal</span>
                  <p className={styles.hotStore}>{product.store}</p>
                  <h3 className={styles.hotTitle}>{product.name}</h3>
                  <p className={styles.hotPrice}>{formatPrice(product.price)}</p>
                  <Link
                    href={buildProductDetailHref(product)}
                    className={styles.hotBtn}
                  >
                    Shop now
                  </Link>
                </div>
              </div>
            ))}

            <button
              type="button"
              className={`${styles.hotNavBtn} ${styles.hotNavPrev}`}
              onClick={prevHot}
              aria-label="Previous hot product"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className={`${styles.hotNavBtn} ${styles.hotNavNext}`}
              onClick={nextHot}
              aria-label="Next hot product"
            >
              <ChevronRight />
            </button>

            <div className={styles.hotDots}>
              {HOT_PRODUCTS.map((p, index) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  className={`${styles.hotDot} ${index === hotIndex ? styles.hotDotActive : ""}`}
                  onClick={() => setHotIndex(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Discount offers — slide carousel */}
        <section className={styles.dealSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Discount Offers</h2>
              <p className={styles.sectionSub}>Limited-time deals you can&apos;t miss</p>
            </div>
            <span className={`${styles.pill} ${styles.pillDeal}`}>⚡ Up to 50% off</span>
          </div>

          <div className={styles.dealCarousel}>
            <button
              type="button"
              className={`${styles.dealNavBtn} ${styles.dealNavPrev}`}
              onClick={prevDeal}
              aria-label="Previous deal"
            >
              <ChevronLeft />
            </button>

            <div className={styles.dealViewport}>
              <div
                className={styles.dealTrack}
                style={{
                  transform: `translateX(-${dealIndex * (100 / dealsPerView)}%)`,
                }}
              >
                {DEAL_PRODUCTS.map((deal) => (
                  <div
                    key={deal.id}
                    className={styles.dealSlide}
                    style={{ flex: `0 0 ${100 / dealsPerView}%` }}
                  >
                    <DealCard
                      deal={deal}
                      onToggleCart={handleToggleCart}
                      isInCart={cartIds.has(deal.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`${styles.dealNavBtn} ${styles.dealNavNext}`}
              onClick={nextDeal}
              aria-label="Next deal"
            >
              <ChevronRight />
            </button>
          </div>

          <div className={styles.dealDots}>
            {Array.from({ length: maxDealIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to deal page ${index + 1}`}
                className={`${styles.dealDot} ${index === dealIndex ? styles.dealDotActive : ""}`}
                onClick={() => setDealIndex(index)}
              />
            ))}
          </div>
        </section>

        {/* All products grid */}
        <section className={styles.gridSection}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>All Products</h2>
              <p className={styles.sectionSub}>
                Curated from trusted vendors across Marketo
              </p>
            </div>
            <span className={styles.sectionSub}>
              {allProducts.length} items
            </span>
          </div>

          {isLoadingProducts ? (
            <div className={styles.productGrid}>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.productCard} style={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className={styles.spinner} />
                </div>
              ))}
            </div>
          ) : allProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No products available right now.</p>
              <p className={styles.emptyText}>Please check back soon for new listings.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleCart={handleToggleCart}
                  isInCart={cartIds.has(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          © 2026 <span className={styles.footerBrand}>Marketo</span> — Shop smarter,
          live better
        </p>
      </footer>
    </div>
  );
}
