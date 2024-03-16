import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  userLoggedIn: false,
  userData: {},
  // userToken: null, // for storing the JWT
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.userLoggedIn = true
      state.userData = action.payload.userData
      // state.userToken = action.payload.token
    },
    logoutSuccess: (state, action) => {
      return initialState
    },
    updateSettings: (state, action) => {
      state.userData = action.payload.userData
    },
    updateTagList: (state, action) => {
      state.userData.tags = [...state.userData.tags, action.payload]
    },
    removeFromTagList: (state, action) => {
      state.userData.tags = [...state.userData.tags.filter(tag => tag.tagID !== action.payload)]
    }
  },
})
export const { loginSuccess, logoutSuccess, updateSettings, updateTagList, removeFromTagList} = authSlice.actions
export default authSlice.reducer

export const selectUserLoggedIn = (state) => state.auth.userLoggedIn
export const selectCurrentUser = (state) => state.auth.userData.user
export const selectUserTags = (state) => state.auth.userData.tags