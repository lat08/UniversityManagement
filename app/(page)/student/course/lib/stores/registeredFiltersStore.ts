import { create } from 'zustand';

export type RegisteredFilters = {
  searchQuery: string;
  selectedStatus: string;
};

export type RegisteredFiltersState = {
  filters: RegisteredFilters;
  tempFilters: RegisteredFilters;
};

type RegisteredFiltersActions = {
  setTempFilters: (filters: Partial<RegisteredFilters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
};

const initialFilters: RegisteredFilters = {
  searchQuery: '',
  selectedStatus: '',
};

export const useRegisteredFiltersStore = create<RegisteredFiltersState & RegisteredFiltersActions>((set) => ({
  filters: { ...initialFilters },
  tempFilters: { ...initialFilters },
  setTempFilters: (newFilters) =>
    set((state) => ({
      tempFilters: { ...state.tempFilters, ...newFilters },
    })),
  applyFilters: () =>
    set((state) => ({
      filters: { ...state.tempFilters },
    })),
  resetFilters: () =>
    set({
      filters: { ...initialFilters },
      tempFilters: { ...initialFilters },
    }),
}));
