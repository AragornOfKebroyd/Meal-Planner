import { createSelector, createEntityAdapter } from "@reduxjs/toolkit"
import { apiSlice } from "../api/apiSlice"

const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()

// extends the base apiSlice which goes into the store
// should match with the routes in the backend
export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAllUsers: builder.query({
      query: () => ({
        url: '/user/all',
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError
        }
      }),
      transformResponse: responseData => {
        const loadedUsers = responseData.map(user => {
          user.id = user.userID
          return user
        })
        return usersAdapter.setAll(initialState, loadedUsers)
      },
      providesTags: (result, error, arg) => {
        return result ? [
          { type: 'User', id:'List'},
          ...result.ids.map(id => ({type: 'User', id:id }))
        ] : []
      }
    }),
    getUser: builder.query({
      query: ({ userID }) => ({
        url: `/user/${userID}`
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          { type: 'User', id:result.userID }
        ] : []
      }
    }),
    updateUserData: builder.mutation({
      query: userData => ({
        url: `/user/${userData.user.userID}`,
        method: 'PATCH',
        body: userData
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: 'LIST' },
        { type: 'User', id: result.user.userID }
      ]
    }),
    addTag: builder.mutation({
      query: ({userID, tagName}) => ({
        url: `/user/tags/${userID}`,
        method: 'POST',
        body: {tagName}
      })
    }),
    removeTag: builder.mutation({
      query: ({userID, tagID}) => ({
        url: `/user/tags/${userID}`,
        method: 'DELETE',
        body: {tagID}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Recipe', id: 'LIST' }
      ]
    }),
    getCupboardItems: builder.query({
      query: ({userID}) => ({
        url: `/user/cupboard/${userID}`
      }),
      providesTags: (result, error, arg) => {
        return [{ type: 'User', id: 'CUPBOARD_ITEMS' }]
      }
    }),
    updateCupboardItems: builder.mutation({
      query: ({userID, cupboard}) => ({
        url: `/user/cupboard/${userID}`,
        method: 'PATCH',
        body: {cupboard}
      }),
      invalidatesTags: (result, error, arg) =>  [
        { type: 'User', id: 'CUPBOARD_ITEMS' }
      ]
    })
  })
})

export const {
  useGetAllUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
  useUpdateUserDataMutation,
  useAddTagMutation,
  useRemoveTagMutation,
  useGetCupboardItemsQuery,
  useUpdateCupboardItemsMutation
} = usersApiSlice

// stuff that redux does

export const selectUsersResult = usersApiSlice.endpoints.getAllUsers.select()

// creates memoized selector
const selectUsersData = createSelector(
  selectUsersResult,
  usersResult => usersResult.data // normalised state object with ids and entities
)

//getselectors creates these automatically and they are being renamed with aliases
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState) // pass in a selector that returns the users slice of state