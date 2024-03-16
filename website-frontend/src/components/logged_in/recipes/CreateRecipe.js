import { useEffect, useState } from "react"
import CreateEditRecipeCommon from "./CreateEditRecipeCommon"
import { useDispatch, useSelector } from "react-redux"
import { selectCurrentUser } from "../../../app/state/authSlice"
import { useCreateUserRecipeMutation } from "../../../app/services/recipesApiSlice"
import { useNavigate } from "react-router-dom"
import { addSavedRecipe } from "../../../app/state/userDataSlice"

const CreateRecipe = () => {
  const initialState = {
    recipe: {
      title: '',
      description: null,
      website: null,
      url: null,
      image: null,
      prep_time: null,
      cook_time: null,
      total_time: null,
      yield_number: null,
      author: useSelector(selectCurrentUser).username,
      instructions_list: [],
      ingredient_groups: [{ingredients: [], purpose: 'user_app'}],
      calories: null,
      carbohydrateContent: null,
      proteinContent: null,
      fatContent: null,
      sodiumContent: null,
      cholesterolContent: null,
      saturatedFatContent: null,
      sugarContent: null,
      fiberContent: null,
      unsaturatedFatContent: null,
      transFatContent: null,
    }
  }
  const [currentData, setCurrentData] = useState(initialState)

  const userID = useSelector(selectCurrentUser).userID

  const dispatch = useDispatch()

  const [createRecipe, {data: createUserRecipeData, isSuccess: isCreateUserRecipeSuccess}] = useCreateUserRecipeMutation()

  const onSaveClicked = (e) => {
    e.preventDefault()
    const sendData = currentData.recipe
    const notNullData = Object.fromEntries(Object.entries(sendData).filter(([_, v]) => v != null))
    notNullData.ingredient_groups = JSON.stringify(notNullData.ingredient_groups)
    notNullData.instructions_list = JSON.stringify(notNullData.instructions_list)
    createRecipe({userID, options: notNullData})
  }

  const navigate = useNavigate()

  useEffect(() => {
    if (isCreateUserRecipeSuccess) {
      const recipeID = createUserRecipeData.saved.recipeID
      dispatch(addSavedRecipe(recipeID))
      navigate('/app/recipes')
    }
  }, [isCreateUserRecipeSuccess])

  return (
    <CreateEditRecipeCommon currentData={currentData} originalData={initialState} setCurrentData={setCurrentData} name={'Create Recipe'} onSaveClicked={onSaveClicked}/>
  )
}

export default CreateRecipe