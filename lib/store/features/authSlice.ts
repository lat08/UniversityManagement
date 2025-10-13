import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = {
	id?: string | number;
	email?: string | null;
	name?: string | null;
	role?: string | null;
};

export type AuthState = {
	accessToken: string | null;
	user: User | null;
	isAuthenticated: boolean;
};

const initialState: AuthState = {
	accessToken: null,
	user: null,
	isAuthenticated: false,
};

type LoginPayload = {
	accessToken: string;
	user?: User | null;
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
			state.accessToken = action.payload.accessToken;
			state.user = action.payload.user ?? null;
			state.isAuthenticated = true;
		},
		logout: (state) => {
			state.accessToken = null;
			state.user = null;
			state.isAuthenticated = false;
		},
		restoreAuth: (state, action: PayloadAction<AuthState>) => {
			state.accessToken = action.payload.accessToken;
			state.user = action.payload.user;
			state.isAuthenticated = action.payload.isAuthenticated;
		}
	}
});

export const { loginSuccess, logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;