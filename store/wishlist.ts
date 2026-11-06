"use client";

import { create } from "zustand";

type WishlistState = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
};

export const useWishlist = create<WishlistState>((set, get) => ({
  slugs: [],
  toggle: (slug) => {
    const exists = get().slugs.includes(slug);
    set({ slugs: exists ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] });
  },
  has: (slug) => get().slugs.includes(slug),
}));
