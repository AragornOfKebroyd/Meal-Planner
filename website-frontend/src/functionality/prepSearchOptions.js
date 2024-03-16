import { prepareNutrients } from './nutritionPreperation'

export const prepRecipeOptionsSettings = (currentData) => {
  const nutrients = prepareNutrients(currentData)
    
  const vegetarian = currentData.user.vegetarian
  const vegan = currentData.user.vegan

  const recipeOptions = {
    ...nutrients,
    ...(vegetarian && {'vegetarian': vegetarian}),
    ...(vegan && {'vegan': vegan})
  }
  return recipeOptions
}

export const prepIngredientOptionsSettings = (currentData) => {
  const exIngredients = currentData.excluded_ingredients
  const excludedIDs = [].concat(...exIngredients.map(ing => ing.ingredientIDs))
  const ingredientOptions = Object.fromEntries(
    excludedIDs.map(id => [id, 0])
  )

  return ingredientOptions
}

export const prepWebsiteOptionsSearch = (selectedWebsites, searchOptions, setSearchOptions) => {
  const includeSites = selectedWebsites.filter(website => website.include).map(website => `'${website.url}'`)
  const excludeSites = selectedWebsites.filter(website => !website.include).map(website =>  `'${website.url}'`)
  if (includeSites.length || excludeSites.length) {
    const query = [includeSites.length && `recipe.website IN (${includeSites.join(',')})`, excludeSites.length && `recipe.website NOT IN (${excludeSites.join(',')})`].filter(a => a).join(' AND ')
    const newOpts = {...searchOptions, recipeOptions: {...searchOptions.recipeOptions, 'website': ['SQL',query]}}
    setSearchOptions(newOpts)
  } else {
    const newOpts = {...searchOptions}
    delete newOpts.recipeOptions.website
    setSearchOptions(newOpts)
  }
}

export const prepIngredientOptionsSearch = (selectedIngredients, searchOptions, setSearchOptions) => {
  const includeIngredients = selectedIngredients.filter(ingredient => ingredient.include).map(ingredient => ingredient.ingredientID)
  const excludeIngredients = selectedIngredients.filter(ingredient => !ingredient.include).map(ingredient => ingredient.ingredientID)
  
  const ingredientOptions = Object.fromEntries(
    includeIngredients.map(id => [id, 1]).concat(
      excludeIngredients.map(id => [id, 0])
    )
  )
  const newOpts = {...searchOptions, ingredientOptions}
  setSearchOptions(newOpts)
}

export const prepCuisineOptionsSearch = (selectedCuisines, searchOptions, setSearchOptions) => {
  const includeCuisines = selectedCuisines.filter(cuisine => cuisine.include).map(cuisine => cuisine.cuisineID)
  const excludeCuisines = selectedCuisines.filter(cuisine => !cuisine.include).map(cuisine => cuisine.cuisineID)
  
  const cuisineOptions = Object.fromEntries(
    includeCuisines.map(id => [id, 1]).concat(
      excludeCuisines.map(id => [id, 0])
    )
  )
  const newOpts = {...searchOptions, cuisineOptions}
  setSearchOptions(newOpts)
}

export const prepCategoryOptionsSearch = (selectedCategorys, searchOptions, setSearchOptions) => {
  const includeCategorys = selectedCategorys.filter(category => category.include).map(category => category.categoryID)
  const excludeCategorys = selectedCategorys.filter(category => !category.include).map(category => category.categoryID)
  
  const categoryOptions = Object.fromEntries(
    includeCategorys.map(id => [id, 1]).concat(
      excludeCategorys.map(id => [id, 0])
    )
  )
  const newOpts = {...searchOptions, categoryOptions}
  setSearchOptions(newOpts)
}

export const prepNutrientsOptionsSearch = (currentData, searchOptions, setSearchOptions) => {
  const nutrients = prepareNutrients(currentData)
  const newRecipeData = searchOptions.recipeOptions
  const getRidOf = ['calories', 'carbohydrateContent', 'cholesterolContent', 'fatContent', 'fiberContent', 'proteinContent', 'sodiumContent', 'sugarContent']
  getRidOf.forEach((content) => {
    delete newRecipeData[content]
  })
  const newOpts = {...newRecipeData, ...nutrients}

  setSearchOptions({...searchOptions, recipeOptions: newOpts})
}