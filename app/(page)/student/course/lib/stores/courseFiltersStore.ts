import { create } from 'zustand';
import type { CourseDto } from '../type/courseType';

export type CourseFilters = {
  searchQuery: string;
  availableOnly: boolean | null;
  isGeneral: boolean | null;
  isInStudentCurriculum: boolean | null;
};

export type CourseFiltersState = {
  filters: CourseFilters;
  tempFilters: CourseFilters;
  selectedCourseIds: Set<string>;
  selectedCoursesCache: Map<string, CourseDto>; // Cache course data để check conflict
};

type CourseFiltersActions = {
  setTempFilters: (filters: Partial<CourseFilters>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  setSelectedCourseIds: (ids: Set<string>) => void;
  addSelectedCourse: (course: CourseDto) => void;
  removeSelectedCourseId: (id: string) => void;
  clearSelectedCourseIds: () => void;
};

const initialFilters: CourseFilters = {
  searchQuery: '',
  availableOnly: null,
  isGeneral: null,
  isInStudentCurriculum: null,
};

export const useCourseFiltersStore = create<CourseFiltersState & CourseFiltersActions>((set) => ({
  filters: { ...initialFilters },
  tempFilters: { ...initialFilters },
  selectedCourseIds: new Set(),
  selectedCoursesCache: new Map(),
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
  setSelectedCourseIds: (ids) =>
    set({ selectedCourseIds: ids }),
  addSelectedCourse: (course) =>
    set((state) => {
      const newSet = new Set(state.selectedCourseIds);
      newSet.add(course.courseId);
      const newCache = new Map(state.selectedCoursesCache);
      newCache.set(course.courseId, course);
      return { 
        selectedCourseIds: newSet,
        selectedCoursesCache: newCache
      };
    }),
  removeSelectedCourseId: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedCourseIds);
      newSet.delete(id);
      const newCache = new Map(state.selectedCoursesCache);
      newCache.delete(id);
      return { 
        selectedCourseIds: newSet,
        selectedCoursesCache: newCache
      };
    }),
  clearSelectedCourseIds: () =>
    set({ 
      selectedCourseIds: new Set(),
      selectedCoursesCache: new Map()
    }),
}));
