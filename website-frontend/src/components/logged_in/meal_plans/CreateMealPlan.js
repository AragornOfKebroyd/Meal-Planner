import { useEffect, useState } from 'react'
import './CreateMealPlan.css'
import { useLocation, useNavigate } from 'react-router-dom'
import CreateEditMealPlanCommon from './CreateEditMealPlanCommon'
import { exchangeMealPlanData } from './CreateEditMealPlanCommon'
import { useCreateMealPlanMutation } from '../../../app/services/meal_plansApiSlice'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../app/state/authSlice'
import _ from 'lodash'

const empty_day = {
  breakfast: null,
  lunch: null,
  dinner: null
}

const initalData = {
  formatted: [
    {...empty_day},
    {...empty_day},
    {...empty_day},
    {...empty_day},
    {...empty_day},
    {...empty_day},
    {...empty_day}
  ],
  meal_plan: {
    name: '',
    monday_breakfast: null,
    monday_lunch: null,
    monday_dinner: null,
    tuesday_breakfast: null,
    tuesday_lunch: null,
    tuesday_dinner: null,
    wednesday_breakfast: null,
    wednesday_lunch: null,
    wednesday_dinner: null,
    thurday_breakfast: null,
    thurday_lunch: null,
    thurday_dinner: null,
    friday_breakfast: null,
    friday_lunch: null,
    friday_dinner: null,
    saturday_breakfast: null,
    saturday_lunch: null,
    saturday_dinner: null,
    sunday_breakfast: null,
    sunday_lunch: null,
    sunday_dinner: null
  }
}

const CreateMealPlan = () => {
  const userID = useSelector(selectCurrentUser).userID
  const navigate = useNavigate()
  const loc = useLocation()
  const state = loc?.state
  const [currentData, setCurrentData] = useState(state
    ? exchangeMealPlanData(state.currentData, state.selectedRecipe, state.recipe)
    : initalData)
    
  // then just the same as edit meal plan
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [type, setType] = useState('')

  useEffect(() => {
    if (!selectedRecipe) return
    if (type === 'add'){
      navigate(`/app/recipes/select`, {state: {path: `/app/meal-plans/create`, currentData: currentData, selectedRecipe: selectedRecipe} })
    } else if (type === 'rem') {
      setCurrentData(exchangeMealPlanData(currentData, selectedRecipe, null))
    }
  }, [selectedRecipe, type])
  

  // save meal plan
  const [createMealPlan, {data: createMealPlanData, isSuccess: isCreateMealPlanSuccess, isError: isCreateMealPlanError, error: createMealPlanError}] = useCreateMealPlanMutation()

  const onSaveButtonClicked = (e) => {
    e.preventDefault()
    const options = currentData.meal_plan
    createMealPlan({userID, options})
  }

  useEffect(() => {
    if (isCreateMealPlanError) {
      console.error(createMealPlanError)
    }
  }, [isCreateMealPlanError])

  useEffect(() => {
    if (isCreateMealPlanSuccess) {
      // console.log(createMealPlanData)
      navigate('/app/meal-plans')
    }
  }, [isCreateMealPlanSuccess])

  return (
    <CreateEditMealPlanCommon 
      currentData={currentData} 
      setCurrentData={setCurrentData} 
      setSelectedRecipe={setSelectedRecipe} 
      setType={setType} 
      name={'Create Meal Plan'} 
      onSaveButtonClicked={onSaveButtonClicked} 
      changesMade={!_.isEqual(initalData, currentData)}/>
  )
}

export default CreateMealPlan