import { atom, computed } from 'nanostores';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

function loadCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem('vectra-cart');
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export const cartItems = atom<CartItem[]>(loadCart());
export const cartOpen = atom<boolean>(false);

// Persist every change to localStorage
cartItems.subscribe((items) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('vectra-cart', JSON.stringify(items));
  }
});

export const cartCount = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export function addToCart(item: Omit<CartItem, 'quantity'>) {
  const current = cartItems.get();
  const existing = current.find((i) => i.id === item.id);
  if (existing) {
    cartItems.set(
      current.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  } else {
    cartItems.set([...current, { ...item, quantity: 1 }]);
  }
  cartOpen.set(true);
}

export function removeFromCart(id: string) {
  cartItems.set(cartItems.get().filter((i) => i.id !== id));
}

export function updateQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(id);
    return;
  }
  cartItems.set(
    cartItems.get().map((i) => (i.id === id ? { ...i, quantity } : i))
  );
}

export function clearCart() {
  cartItems.set([]);
}
