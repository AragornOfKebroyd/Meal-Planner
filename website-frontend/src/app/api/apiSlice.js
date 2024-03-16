import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASEURL = process.env.REACT_APP_BASE_URL

const baseQuery = fetchBaseQuery({
  baseUrl: BASEURL,
  // credentials: 'include', // allways send cookie
  // prepareHeaders: (headers, api) => {
  //   const token = api.getState().auth.token

  //   if (token) {
  //     headers.set('Authorization', `Bearer ${token}`)
  //   }
  //   return headers
  // }
})

export const apiSlice = createApi({
  baseQuery: baseQuery,
  tagTypes: ['User, Recipe, MealPlan'], // different caches
  endpoints: builder => ({}) // is extended
})