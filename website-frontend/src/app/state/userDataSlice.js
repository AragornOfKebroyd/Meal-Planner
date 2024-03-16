import { createSlice } from '@reduxjs/toolkit'
import { recipesApiSlice } from '../services/recipesApiSlice'

const initialState = {
  savedRecipes: [],
  started: false,
  fetched: false,
  isError: false,
  error: null
}

const userDataSlice = createSlice({
  name: 'userdata',
  initialState,
  reducers: {
    fetchUserDataStarted: (state, action) => {
      state.started = true
    },
    fetchUserDataSuccess: (state, action) => {
      state.savedRecipes = action.payload.savedRecipes
      state.fetched = true
      state.started = false
    },
    fetchUserDataFailure: (state, action) => {
      state.isError = true
      state.error = action.payload.message
      console.error(action.payload)
    },
    addSavedRecipe: (state, action) => {
      state.savedRecipes = [...state.savedRecipes, action.payload]
    },
    removeSavedRecipe: (state, action) => {
      state.savedRecipes = [...state.savedRecipes.filter(recipeID => recipeID !== action.payload)]
    },
    logoutSuccess: (state, action) => {
      return initialState
    },
  },
})

export const { fetchUserDataStarted, fetchUserDataSuccess, fetchUserDataFailure, logoutSuccess, addSavedRecipe, removeSavedRecipe } = userDataSlice.actions

export const fetchUserData = () => async (dispatch, getState) => {
  const state = getState()
  if (state.userdata.fetched === true) {
    console.log('allready fetched')
    return
  }
  try {
    dispatch(fetchUserDataStarted())
    // Dispatch the necessary API queries using RTK Query
    console.log(state.auth.userData.user)
    const savedRecipes = await dispatch(recipesApiSlice.endpoints.getSavedAndUserRecipes.initiate({userID: state.auth.userData.user.userID, IDsOnly: true}))
    const savedRecipeIDs = savedRecipes.data.map(r => r.recipeID)
    
    // Further logic or combine data if needed
    const userData = {
      savedRecipes: savedRecipeIDs
    }

    dispatch(fetchUserDataSuccess(userData));
  } catch (err) {
    dispatch(fetchUserDataFailure(err));
  }
}

export default userDataSlice.reducer
export const dataFetched = (state) => state.userdata.fetched
export const selectUserSavedRecipes = (state) => state.userdata.savedRecipes