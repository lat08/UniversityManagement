import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

type LoginPayload = {
	accessToken: string;
	refreshToken?: string;
	expiresAt?: string;
	user?: User | null;
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken ?? null;
			state.expiresAt = action.payload.expiresAt ?? null;
			state.user = action.payload.user ?? null;
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.accessToken = null;
			state.refreshToken = null;
			state.expiresAt = null;
			state.user = null;
			state.isAuthenticated = false;
			state.forgotPasswordFlow = {
				email: null,
				passwordResetToken: null,
				step: null,
			};
		},
		restoreAuth: (state, action: PayloadAction<AuthState>) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.expiresAt = action.payload.expiresAt;
			state.user = action.payload.user;
			state.isAuthenticated = action.payload.isAuthenticated;
		},
		refreshTokenSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string; expiresAt: string }>) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.expiresAt = action.payload.expiresAt;
		},
		setForgotPasswordEmail: (state, action: PayloadAction<string>) => {
			state.forgotPasswordFlow.email = action.payload;
			state.forgotPasswordFlow.step = 'otp';
		},
		setPasswordResetToken: (state, action: PayloadAction<string>) => {
			state.forgotPasswordFlow.passwordResetToken = action.payload;
			state.forgotPasswordFlow.step = 'reset';
		},
		clearForgotPasswordFlow: (state) => {
			state.forgotPasswordFlow = {
				email: null,
				passwordResetToken: null,
				step: null,
			};
		}
	}
});

export const { 
	loginSuccess, 
	logout, 
	restoreAuth, 
	refreshTokenSuccess,
	setForgotPasswordEmail,
	setPasswordResetToken,
	clearForgotPasswordFlow
} = authSlice.actions;
export default authSlice.reducer;