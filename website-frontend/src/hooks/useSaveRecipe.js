import { useDispatch, useSelector } from "react-redux"
import { selectCurrentUser } from "../app/state/authSlice"
import { useSaveRecipeMutation, useUnsaveRecipeMutation } from "../app/services/recipesApiSlice"
import { useEffect, useState } from "react"
import { addSavedRecipe, removeSavedRecipe, selectUserSavedRecipes } from "../app/state/userDataSlice"

const useSaveRecipe = (recipeID) => {
  const recipeIDNumber = Number(recipeID)
  const dispatch = useDispatch()

  const [unsaveRecipe, {isSuccess: isUnsaveRecipeSuccess, isError: isUnsaveRecipeError}] = useUnsaveRecipeMutation()
  const [saveRecipe, {isSuccess: isSaveRecipeSuccess, isError: isSaveRecipeError}] = useSaveRecipeMutation()
  const userID = useSelector(selectCurrentUser).userID
  const [saved, setSaved] = useState(useSelector(selectUserSavedRecipes).includes(recipeIDNumber))

  const saveRecipeClicked = () => {
    saveRecipe({ userID, recipeID: recipeIDNumber })
    dispatch(addSavedRecipe(recipeIDNumber))
  }

  useEffect(() => {
      if (isSaveRecipeError) {
        dispatch(removeSavedRecipe(recipeIDNumber))
      }
    }, [isSaveRecipeError])

  useEffect(() => {
      if (isSaveRecipeSuccess) {
        setSaved(true)
      }
    }, [isSaveRecipeSuccess])
    
  const unsaveRecipeClicked = () => {
      unsaveRecipe({ userID, recipeID: recipeIDNumber })
      dispatch(removeSavedRecipe(recipeIDNumber))
    }

  useEffect(() => {
    if (isUnsaveRecipeError) {
      dispatch(addSavedRecipe(recipeIDNumber))
    }
  }, [isUnsaveRecipeError])

  useEffect(() => {
    if (isUnsaveRecipeSuccess) {
      setSaved(false)
    }
  }, [isUnsaveRecipeSuccess])

  return [saved, saveRecipeClicked, unsaveRecipeClicked]
}

export default useSaveRecipe