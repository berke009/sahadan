import { create } from 'zustand';
import { WatchlistItem } from '../types';

interface WatchlistState {
  items: WatchlistItem[];
  addItem: (item: WatchlistItem) => void;
  removeItem: (matchId: string, market: string) => void;
  toggleItem: (item: WatchlistItem) => void;
  clearWatchlist: () => void;
}

export const useCouponStore = create<WatchlistState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get();
    const filtered = items.filter(
      (i) => !(i.match_id === item.match_id && i.market === item.market)
    );
    set({ items: [...filtered, item] });
  },

  removeItem: (matchId, market) => {
    const { items } = get();
    set({
      items: items.filter((i) => !(i.match_id === matchId && i.market === market)),
    });
  },

  toggleItem: (item) => {
    const { items } = get();
    const exists = items.find(
      (i) =>
        i.match_id === item.match_id &&
        i.market === item.market &&
        i.selection === item.selection
    );
    if (exists) {
      get().removeItem(item.match_id, item.market);
    } else {
      get().addItem(item);
    }
  },

  clearWatchlist: () => {
    set({ items: [] });
  },
}));
