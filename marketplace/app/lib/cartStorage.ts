export type CartItem = {
  id: number;
  name: string;
  store: string;
  price: number;
  rating: number;
  image: string;
  qty: number;
};

const CART_KEY = "marketo_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Omit<CartItem, "qty">) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCartStorage(id: number) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
}
