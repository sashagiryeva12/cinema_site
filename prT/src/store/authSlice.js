import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload
    },
    setAuthLoading(state, action) {
      state.loading = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.loading = false
    },
  },
})

export const { setUser, setAuthLoading, clearAuth } = authSlice.actions
export default authSlice.reducer