// import { createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../api/apiSlice"

// const authAdapter = createEntityAdapter({})

// const initialState = authAdapter.getInitialState()

// extends the base apiSlice which goes into the store
// should match with the routes in the backend
export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: {...credentials}
      })
    }),
    addNewUser: builder.mutation({
      query: initialUserData => ({
        url: '/auth/register',
        method: 'POST',
        body: {...initialUserData}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: 'LIST'}
      ]
    }),
    logout: builder.mutation({
      query: ({ userID }) => ({
        url: '/auth/logout',
        method: 'POST',
        body: { userID }
      })
    }),
    changePassword: builder.mutation({
      query: ({ userID, password, newPassword }) => ({
        url: '/auth/changepassword',
        method: 'POST',
        body: { userID, password, newPassword }
      })
    }),
  })
})

export const {
  useLoginMutation,
  useAddNewUserMutation,
  useLogoutMutation,
  useChangePasswordMutation
} = authApiSlice