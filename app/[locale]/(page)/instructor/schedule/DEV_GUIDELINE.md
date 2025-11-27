feature_name: Schedule
user_role: Instructor
screens_and_ui_flow:
- Primary route: `app/[locale]/(page)/instructor/schedule/page.tsx` orchestrates data fetch, filters, and action triggers.
- Nested routes: `semester`, `weekly` (mirror detail or sub-workflows).
- Entry screens must set page titles via `usePageTitle` and wrap async sections with skeleton fallbacks.
component_structure:
- UI layer currently centralized in the page component; add dedicated sub-components for future complexity.
- lib/api: `semesterScheduleApi.ts`, `weeklyScheduleApi.ts`.
- lib/constants: `index.ts`.
- lib/hooks: `useInstructorScheduleData.ts`, `useInstructorSemesterSchedule.old.ts`, `useInstructorSemesterSchedule.ts`, `useInstructorSemesterScheduleData.ts`, `useInstructorWeeklySchedule.old.ts`, `useInstructorWeeklySchedule.ts`.
- lib/types: `semesterTypes.ts`, `weeklyTypes.ts`.
- Shared UI primitives live in `app/components/ui`; stay consistent with Button, Dropdown, SearchInput, ResizableTable, etc.
state_management:
- Data layer uses React Query via custom hooks (`useInstructorScheduleData.ts`, `useInstructorSemesterSchedule.old.ts`, `useInstructorSemesterSchedule.ts`, `useInstructorSemesterScheduleData.ts`, `useInstructorWeeklySchedule.old.ts`, `useInstructorWeeklySchedule.ts`). Keep query keys in `lib/api/queryKeys` and memoize filters.
- Local UI state handles modals, selection sets, debounced search, and column config. Keep derived data memoized with `useMemo` and wrap callbacks in `useCallback`.
form_validations:
- When adding forms, base them on `react-hook-form` with schema resolvers and localized error strings.
- Pre-fill edit modals via `reset` and keep date/number parsing centralized.
api_integration:
- REST clients live in lib/api (`semesterScheduleApi.ts`, `weeklyScheduleApi.ts`). They wrap axios instance (`@/lib/api/client`) and normalize camelCase/PascalCase payloads.
- Always return `ApiResponse` objects; map `totalCount/TotalCount` variants and expose helpers for stats.
error_handling_and_notifications:
- Wrap async actions with try/catch and surface feedback via `toast`/`sonner`. Provide granular error messages for bulk operations.
- Disable controls while requests are in-flight and show skeletons or inline banners for fatal errors.
i18n_and_accessibility:
- Pull copy from `next-intl` namespaces (e.g., `instructor.schedule`) and keep translation keys synchronized across components and modals.
- Ensure tables/buttons expose aria-labels for icon-only actions and respect keyboard navigation inside dropdowns/modals.
performance_and_caching:
- Use React Query cache windows defined in `app/providers.tsx`; rely on `keepPreviousData` for paginated lists.
- Debounce expensive filters, lazy-load heavy modals via `dynamic()` if bundle size grows, and guard large tables with virtualization or progressive rendering.
testing_strategy:
- Add React Testing Library specs for list filtering, modals, and mutation flows. Mock API layer via MSW, and cover hook logic with pure unit tests.
- Smoke-test translations and permission guards per role route in Playwright or Cypress.