import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isBookingOpen: false,
    isSidebarOpen: false,
  },
  reducers: {
    setBookingOpen(state, action) {
      state.isBookingOpen = action.payload
    },
    setSidebarOpen(state, action) {
      state.isSidebarOpen = action.payload
    },
  },
})

export const { setBookingOpen, setSidebarOpen } = uiSlice.actions
export default uiSlice.reducer