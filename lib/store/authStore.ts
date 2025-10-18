import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type User = {
	id?: string | number;
	email?: string | null;
	name?: string | null;
	role?: string | null;
};

export type ForgotPasswordFlow = {
	email: string | null;
	passwordResetToken: string | null;
	step: 'otp' | 'reset' | null;
};

export type AuthState = {
	accessToken: string | null;
	refreshToken: string | null;
	user: User | null;
	isAuthenticated: boolean;
	expiresAt: string | null;
	forgotPasswordFlow: ForgotPasswordFlow;
};

type AuthActions = {
	loginSuccess: (payload: {
		accessToken: string;
		refreshToken?: string;
		expiresAt?: string;
		user?: User | null;
	}) => void;
	logout: () => void;
	refreshTokenSuccess: (payload: {
		accessToken: string;
		refreshToken: string;
		expiresAt: string;
	}) => void;
	setForgotPasswordEmail: (email: string) => void;
	setPasswordResetToken: (token: string) => void;
	clearForgotPasswordFlow: () => void;
};

const initialState: AuthState = {
	accessToken: null,
	refreshToken: null,
	user: null,
	isAuthenticated: false,
	expiresAt: null,
	forgotPasswordFlow: {
		email: null,
		passwordResetToken: null,
		step: null,
	},
};

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set) => ({
			...initialState,
			loginSuccess: (payload) =>
				set({
					accessToken: payload.accessToken,
					refreshToken: payload.refreshToken ?? null,
					expiresAt: payload.expiresAt ?? null,
					user: payload.user ?? null,
					isAuthenticated: true,
				}),
			logout: () =>
				set({
					...initialState,
				}),
			refreshTokenSuccess: (payload) =>
				set({
					accessToken: payload.accessToken,
					refreshToken: payload.refreshToken,
					expiresAt: payload.expiresAt,
				}),
			setForgotPasswordEmail: (email) =>
				set((state) => ({
					forgotPasswordFlow: {
						...state.forgotPasswordFlow,
						email,
						step: 'otp',
					},
				})),
			setPasswordResetToken: (token) =>
				set((state) => ({
					forgotPasswordFlow: {
						...state.forgotPasswordFlow,
						passwordResetToken: token,
						step: 'reset',
					},
				})),
			clearForgotPasswordFlow: () =>
				set({
					forgotPasswordFlow: {
						email: null,
						passwordResetToken: null,
						step: null,
					},
				}),
		}),
		{
			name: 'um_auth_state',
			partialize: (state) => ({
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				expiresAt: state.expiresAt,
			}),
		}
	)
);

