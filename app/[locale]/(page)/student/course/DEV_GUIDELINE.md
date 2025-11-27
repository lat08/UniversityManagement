feature_name: Course
user_role: Student
screens_and_ui_flow:
- Primary route: `app/[locale]/(page)/student/course/page.tsx` orchestrates data fetch, filters, and action triggers.
- Interactive components: `card\CourseCard.tsx`, `content\CoursesContent.tsx`, `content\register\CourseFilters.tsx`, `content\register\RegisterTab.tsx`, `content\registered\RegisteredFilters.tsx`, `content\registered\RegisteredTab.tsx`, `course-skeleton.tsx`, `modal\CourseDetailModal.tsx`.
- Modal flows: `modal\CourseDetailModal.tsx`. Trigger from toolbar/row actions, submit via schema-backed forms, refetch queries on success, and close modals optimistically.
- Entry screens must set page titles via `usePageTitle` and wrap async sections with skeleton fallbacks.
component_structure:
- UI layer split across: 8 components under `components`. Prioritize composition from table/list containers down to action menus.
- lib/api: `coursesApi.ts`.
- lib/constants: `courseConstants.ts`.
- lib/hooks: `useAvailableCourses.ts`, `useAvailableCoursesQuery.ts`, `useRegisteredCourses.ts`, `useRegisteredCoursesQuery.ts`.
- lib/stores: `courseFiltersStore.ts`, `registeredFiltersStore.ts`.
- lib/type: `courseType.ts`.
- Shared UI primitives live in `app/components/ui`; stay consistent with Button, Dropdown, SearchInput, ResizableTable, etc.
state_management:
- Data layer uses React Query via custom hooks (`useAvailableCourses.ts`, `useAvailableCoursesQuery.ts`, `useRegisteredCourses.ts`, `useRegisteredCoursesQuery.ts`). Keep query keys in `lib/api/queryKeys` and memoize filters.
- Persistent UI/filter state lives in Zustand stores (`courseFiltersStore.ts`, `registeredFiltersStore.ts`). Hydrate defaults before mount.
- Local UI state handles modals, selection sets, debounced search, and column config. Keep derived data memoized with `useMemo` and wrap callbacks in `useCallback`.
form_validations:
- Forms live inside `modal\CourseDetailModal.tsx`. Use `react-hook-form` + `yup`/`zod`, surface translations via `next-intl`.
- Pre-fill edit modals via `reset` and keep date/number parsing centralized.
api_integration:
- REST clients live in lib/api (`coursesApi.ts`). They wrap axios instance (`@/lib/api/client`) and normalize camelCase/PascalCase payloads.
- Always return `ApiResponse` objects; map `totalCount/TotalCount` variants and expose helpers for stats.
error_handling_and_notifications:
- Wrap async actions with try/catch and surface feedback via `toast`/`sonner`. Provide granular error messages for bulk operations.
- Disable controls while requests are in-flight and show skeletons or inline banners for fatal errors.
i18n_and_accessibility:
- Pull copy from `next-intl` namespaces (e.g., `student.course`) and keep translation keys synchronized across components and modals.
- Ensure tables/buttons expose aria-labels for icon-only actions and respect keyboard navigation inside dropdowns/modals.
performance_and_caching:
- Use React Query cache windows defined in `app/providers.tsx`; rely on `keepPreviousData` for paginated lists.
- Debounce expensive filters, lazy-load heavy modals via `dynamic()` if bundle size grows, and guard large tables with virtualization or progressive rendering.
testing_strategy:
- Add React Testing Library specs for list filtering, modals, and mutation flows. Mock API layer via MSW, and cover hook logic with pure unit tests.
- Smoke-test translations and permission guards per role route in Playwright or Cypress.