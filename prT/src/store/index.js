import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './uiSlice'
import filtersReducer from './filtersSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    filters: filtersReducer,
    auth: authReducer,
  },
})

export default store