import JSON5 from "json5"
import { apiSlice } from "../api/apiSlice"

// extends the base apiSlice which goes into the store
// should match with the routes in the backend
export const recipesApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getRecipe: builder.query({
      query: ({recipeID, userID}) => ({
        url: `/recipe/${recipeID}/${userID}`
      }),
      transformResponse: (response, meta, arg) => {
        const ingredient_groups = JSON5.parse(response.recipe.ingredient_groups.replaceAll(': None', ': null'))
        const instructions_list = JSON5.parse(response.recipe.instructions_list)
        const transformed = {...response, recipe: {...response.recipe, ingredient_groups, instructions_list}}
        return transformed
      },
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'Recipe', id:'LIST'},
          {type: 'Recipe', id: result.recipeID}
        ] : []
      }
    }),
    getIngredients: builder.mutation({
      query: options => ({ // limit, search
        url: `/recipe/data/ingredients`,
        method: 'POST',
        body: options
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'User', id:'INGREDIENTS'}
        ] : []
      }
    }),
    getWebsites: builder.mutation({
      query: options => ({ // limit, search
        url: `/recipe/data/websites`,
        method: 'POST',
        body: options
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'User', id:'WEBSITES'}
        ] : []
      },
      transformResponse: (response) => {
        const domainName = (url) => url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\..*/, '');
        return response.map(res => {
          return {'url': res.website, 'name': domainName(res.website)}
        })
      }
    }),
    getCuisines: builder.mutation({
      query: options => ({ // limit, search
        url: `/recipe/data/cuisines`,
        method: 'POST',
        body: options
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'User', id:'CUISINES'}
        ] : []
      }
    }),
    getCategories: builder.mutation({
      query: options => ({ // limit, search
        url: `/recipe/data/categories`,
        method: 'POST',
        body: options
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'User', id:'CATEGORIES'}
        ] : []
      }
    }),
    searchRecipes: builder.mutation({
      query: options => ({ // recipeOptions, ingredientOptions, categoryOptions, cuisineOptions, *amount, offset, sortBy, countOnly
        url: `/recipe/search`,
        method: 'POST',
        body: options
      })
    }),
    getSavedAndUserRecipes: builder.query({
      query: ({userID, IDsOnly}) => ({
        url: `/recipe/user/${userID}/saved/${Number(IDsOnly)}`
      }),
      providesTags: (result, error, arg) => {
        return result ? [
          {type: 'User', id: 'SAVED/USER_RECIPES'}
        ] : []
      }
    }),
    saveRecipe: builder.mutation({
      query: ({userID, recipeID}) => ({
        url: `/recipe/user/${userID}/saved`,
        method: 'POST',
        body: {recipeID}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: 'SAVED/USER_RECIPES'},
        { type: 'Recipe', id: 'LIST'}
      ]
    }),
    unsaveRecipe: builder.mutation({
      query: ({userID, recipeID}) => ({
        url: `/recipe/user/${userID}/saved`,
        method: 'DELETE',
        body: {recipeID}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: 'SAVED/USER_RECIPES'},
        { type: 'Recipe', id: 'LIST'}
      ]
    }),
    searchFromIngredients: builder.mutation({
      query: options => ({
        url: `/recipe/fromingredients`,
        method: 'POST',
        body: options
      })
    }),
    setTags: builder.mutation({
      query: ({recipeID, userID, tagIDs}) => ({
        url: `/recipe/${recipeID}/tags`,
        method: 'POST',
        body: {tagIDs, userID}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Recipe', id: 'LIST'},
        { type: 'User', id: 'SAVED/USER_RECIPES' }
      ]
    }),
    updateSavedRecipe: builder.mutation({
      query: ({recipeID, userID, options}) => ({
        url: `/recipe/user/${userID}/saved`,
        method: 'PATCH',
        body: {options, recipeID}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Recipe', id: 'LIST'},
      ]
    }),
    createRecipeCopy: builder.mutation({
      query: ({recipeID, userID}) => ({
        url: `/recipe/${recipeID}/copy`,
        method: 'POST',
        body: {userID}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'User', id: 'SAVED/USER_RECIPES'},
      ]
    }),
    createUserRecipe: builder.mutation({
      query: ({userID, options}) => ({
        url: `/recipe/user/${userID}/created`,
        method: 'POST',
        body: {options}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'User', id: 'SAVED/USER_RECIPES'}
      ]
    }),
    updateUserRecipe: builder.mutation({
      query: ({recipeID, userID, options}) => ({
        url: `/recipe/user/${userID}/created`,
        method: 'PATCH',
        body: {recipeID, options}
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'User', id: 'SAVED/USER_RECIPES' },
        {type: 'MealPlan', id: 'LIST'},
        { type: 'Recipe', id: 'LIST'},
      ]
    }),
    deleteUserRecipe: builder.mutation({
      query: ({recipeID, userID}) => ({
        url: `/recipe/user/${userID}/created`,
        method: 'DELETE',
        body: {recipeID}
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'User', id: 'SAVED/USER_RECIPES'},
        {type: 'MealPlan', id: 'LIST'},
      ]
    })
  })
})

export const {
  useGetRecipeQuery,
  useGetIngredientsMutation,
  useGetWebsitesMutation,
  useGetCuisinesMutation,
  useGetCategoriesMutation,
  useSearchRecipesMutation,
  useGetSavedAndUserRecipesQuery,
  useSaveRecipeMutation,
  useUnsaveRecipeMutation,
  useSearchFromIngredientsMutation,
  useSetTagsMutation,
  useUpdateSavedRecipeMutation,
  useCreateRecipeCopyMutation,
  useCreateUserRecipeMutation,
  useUpdateUserRecipeMutation,
  useDeleteUserRecipeMutation
} = recipesApiSlice