import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetRecipeQuery, useUpdateUserRecipeMutation } from '../../../app/services/recipesApiSlice'
import CreateEditRecipeCommon from './CreateEditRecipeCommon'
import JSON5 from 'json5'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../app/state/authSlice'

const EditRecipe = () => {
  const { recipeID } = useParams()
  const userID = useSelector(selectCurrentUser).userID
  const navigate = useNavigate()

  const {data: getRecipeData, isLoading: isGetRecipeDataLoading, isSuccess: isGetRecipeDataSuccess, isError: isGetRecipeDataError, error: getRecipeDataError } = useGetRecipeQuery({recipeID, userID})

  const [currentData, setCurrentData] = useState(null)

  useEffect(() => {
    if (isGetRecipeDataSuccess) {
      setCurrentData(getRecipeData)
    }
  }, [])

  const [updateRecipe, {isSuccess: isUpdateRecipeSuccess}] = useUpdateUserRecipeMutation()

  const onSaveClicked = (e) => {
    e.preventDefault()
    const sendData = currentData.recipe
    const notNullData = Object.fromEntries(Object.entries(sendData).filter(([_, v]) => v != null))
    notNullData.ingredient_groups = JSON.stringify(notNullData.ingredient_groups)
    notNullData.instructions_list = JSON.stringify(notNullData.instructions_list)
    updateRecipe({recipeID, userID, options: notNullData})
  }

  useEffect(() => {
    if (isUpdateRecipeSuccess) {
      navigate('/app/recipes')
    }
  }, [isUpdateRecipeSuccess])

  return (
    <>
      {isGetRecipeDataSuccess && currentData &&
        <CreateEditRecipeCommon currentData={currentData} originalData={getRecipeData} setCurrentData={setCurrentData} name={'Edit Recipe'} onSaveClicked={onSaveClicked}/>
      }
    </>
  )
}

export default EditRecipe