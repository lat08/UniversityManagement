import { configureStore } from '@reduxjs/toolkit';
import authReducer, { restoreAuth, type AuthState } from './features/authSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
	},
});

// Persist rất gọn bằng localStorage (client-only)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

if (typeof window !== 'undefined') {
	try {
		const raw = localStorage.getItem('um_auth_state');
		if (raw) {
			const parsed = JSON.parse(raw) as { auth: AuthState };
			store.dispatch(restoreAuth(parsed.auth));
		}
		store.subscribe(() => {
			const auth = store.getState().auth as AuthState;
			localStorage.setItem('um_auth_state', JSON.stringify({ auth }));
		});
	} catch {}
}