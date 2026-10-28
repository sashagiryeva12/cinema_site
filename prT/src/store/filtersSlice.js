import { createSlice } from '@reduxjs/toolkit'

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    search: '',
    genre: 'all',
  },
  reducers: {
    setSearch(state, action) {
      state.search = action.payload
    },
    setGenre(state, action) {
      state.genre = action.payload
    },
    resetFilters(state) {
      state.search = ''
      state.genre = 'all'
    },
  },
})

export const { setSearch, setGenre, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer