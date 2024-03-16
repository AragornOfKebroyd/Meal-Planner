import { createSlice } from '@reduxjs/toolkit'
import { recipesApiSlice } from '../services/recipesApiSlice'

const initialState = {
  ingredients: {},
  websites: {},
  cuisines: {},
  categories: {},
  started: false,
  fetched: false,
  isError: false,
  error: null
}

const recipeDataSlice = createSlice({
  name: 'recipedata',
  initialState,
  reducers: {
    fetchRecipeDataStarted: (state, action) => {
      state.started = true
    },
    fetchRecipeDataSuccess: (state, action) => {
      state.ingredients = action.payload.ingredients.data
      state.websites = action.payload.websites.data
      state.cuisines = action.payload.cuisines.data
      state.categories = action.payload.categories.data
      state.fetched = true
      state.started = false
    },
    fetchRecipeDataFailure: (state, action) => {
      state.isError = true
      state.error = action.payload.message
      console.error(action.payload)
    },
    logoutSuccess: (state, action) => {
      return initialState
    }
  },
})

export const { fetchRecipeDataStarted, fetchRecipeDataSuccess, fetchRecipeDataFailure, logoutSuccess } = recipeDataSlice.actions

export const fetchRecipeData = () => async (dispatch, getState) => {
  const state = getState()
  if (state.recipedata.fetched === true) {
    console.log('allready fetched')
    return
  }
  try {
    dispatch(fetchRecipeDataStarted())
    // Dispatch the necessary API queries using RTK Query
    const ingredients = await dispatch(recipesApiSlice.endpoints.getIngredients.initiate())
    const websites = await dispatch(recipesApiSlice.endpoints.getWebsites.initiate());
    const cuisines = await dispatch(recipesApiSlice.endpoints.getCuisines.initiate());
    const categories = await dispatch(recipesApiSlice.endpoints.getCategories.initiate());

    // Further logic or combine data if needed
    const recipeData = {
      ingredients,
      websites,
      cuisines,
      categories,
    };

    dispatch(fetchRecipeDataSuccess(recipeData));
  } catch (err) {
    dispatch(fetchRecipeDataFailure(err));
  }
}

export default recipeDataSlice.reducer
export const dataFetched = (state) => state.recipedata.fetched
export const selectIngredients = (state) => state.recipedata.ingredients
export const selectWebsites = (state) => state.recipedata.websites
export const selectCuisines = (state) => state.recipedata.cuisines
export const selectCategories = (state) => state.recipedata.categories