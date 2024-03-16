import { apiSlice } from "../api/apiSlice"

// extends the base apiSlice which goes into the store
// should match with the routes in the backend
export const mealPlansApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getAllUserMealPlans: builder.query({
      query: (userID) => ({
        url: `/mealplan/user/${userID}`
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          result.meal_plans.map(meal_plan => ({ type: 'MealPlan', id: meal_plan.meal_planID})),
          { type: 'MealPlan', id: 'LIST'}
        ] : []
      }
    }),
    getUserMealPlan: builder.query({
      query: ({userID, meal_planID}) => ({
        url: `/mealplan/user/${userID}/${meal_planID}`
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          { type: 'MealPlan', id: 'LIST'}
        ] : []
      }
    }),
    getActiveUserMealPlan: builder.query({
      query: ({userID}) => ({
        url: `/mealplan/user/${userID}/active`
      }),
      providesTags: (result, error, id) => {
        return result ? [
          { type: 'MealPlan', id},
          { type: 'MealPlan', id: 'LIST'}
        ] : []
      }
    }),
    setActiveMealPlan: builder.mutation({
      query: ({userID, meal_planID}) => ({
        url: `/mealplan/user/${userID}/active`,
        method: 'PATCH',
        body: {meal_planID}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'MealPlan', id: 'LIST'}
      ]
    }),
    updateMealPlan: builder.mutation({
      query: ({userID, meal_planID, options}) => ({
        url: `/mealplan/user/${userID}/${meal_planID}`,
        method: 'PATCH',
        body: {options}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'MealPlan', id: 'LIST'}
      ]
    }),
    createMealPlan: builder.mutation({
      query: ({userID, options}) => ({
        url: `/mealplan/user/${userID}`,
        method: 'POST',
        body: {options}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'MealPlan', id: 'LIST'}
      ]
    }),
    deleteMealPlan: builder.mutation({
      query: ({userID, meal_planID}) => ({
        url: `/mealplan/user/${userID}/${meal_planID}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'MealPlan', id: 'LIST'}
      ]
    }),
    getMealPlanShoppingList: builder.query({
      query: ({userID, meal_planID}) => ({
        url: `/mealplan/user/${userID}/${meal_planID}/shoppinglist`
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          { type: 'MealPlan', id: 'SHOPPING_LIST'}
        ] : []
      }
    }),
    checkShoppingListItems: builder.mutation({
      query: ({userID, meal_planID, checkedIDs}) => ({
        url: `/mealplan/user/${userID}/${meal_planID}/shoppinglist`,
        method: 'PATCH',
        body: {checkedIDs}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'MealPlan', id: 'SHOPPING_LIST'}
      ]
    })
  })
})

export const {
  useGetAllUserMealPlansQuery,
  useGetUserMealPlanQuery,
  useGetActiveUserMealPlanQuery,
  useSetActiveMealPlanMutation,
  useUpdateMealPlanMutation,
  useCreateMealPlanMutation,
  useDeleteMealPlanMutation,
  useGetMealPlanShoppingListQuery,
  useLazyGetMealPlanShoppingListQuery,
  useCheckShoppingListItemsMutation
} = mealPlansApiSlice