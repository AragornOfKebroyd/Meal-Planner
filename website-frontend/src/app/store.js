import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { apiSlice } from "./api/apiSlice"
import authReducer from './state/authSlice'
import recipeDataSlice from './state/recipeDataSlice'
import userDataSlice from "./state/userDataSlice"

import { logger } from "./middleware/logger"
import { rtkQueryErrorLogger } from "./middleware/errorHandling"

// persist state
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const reducers = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer,
  recipedata: recipeDataSlice,
  userdata: userDataSlice
})

// Persist or not
const persistConfig = {
  key: 'root',
  storage,
}
const PERSIST = Boolean(Number(process.env.REACT_APP_PERSIST))
const usedReducers = PERSIST ? persistReducer(persistConfig, reducers) : reducers

// Store config
const store = configureStore({
  reducer: usedReducers,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    immutableCheck: !PERSIST,
    serializableCheck: !PERSIST
  }).concat(apiSlice.middleware, logger, rtkQueryErrorLogger),
  devTools: true
})

// Persist or not
let persistor
if (PERSIST) {
  persistor = persistStore(store)
}

export {
  store, persistor
}

setupListeners(store.dispatch)