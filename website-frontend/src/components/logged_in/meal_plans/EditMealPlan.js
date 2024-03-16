import { useSelector } from 'react-redux'
import { useGetUserMealPlanQuery, useUpdateMealPlanMutation } from '../../../app/services/meal_plansApiSlice'
import './EditMealPlan.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectCurrentUser } from '../../../app/state/authSlice'
import { useEffect, useState } from 'react'
import CreateEditMealPlanCommon from './CreateEditMealPlanCommon'
import { exchangeMealPlanData } from './CreateEditMealPlanCommon'
import _ from 'lodash'

// TODO make a new icon for this page which is bigger.

const DAY_MATCHER = {
  0: 'monday',
  1: 'tuesday',
  2: 'wednesday',
  3: 'thurday',
  4: 'friday',
  5: 'saturday',
  6: 'sunday'
}


const EditMealPlan = () => {
  const loc = useLocation()
  const state = loc?.state

  const navigate = useNavigate()
  const userID = useSelector(selectCurrentUser).userID
  const { meal_planID } = useParams()

  const {data: getUserMealPlanData, isSuccess: isGetUserMealPlanSuccess} = useGetUserMealPlanQuery({userID, meal_planID})
  const [currentData, setCurrentData] = useState(state
    ? exchangeMealPlanData(state.currentData, state.selectedRecipe, state.recipe)
    : null)
  const [display, setDisplay] = useState(state ? true : false)
  
  useEffect(() => {
    if (isGetUserMealPlanSuccess && currentData === null) {
      setCurrentData(getUserMealPlanData)
      setDisplay(true)
    }
  }, [isGetUserMealPlanSuccess])

  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [type, setType] = useState('')

  useEffect(() => {
    if (!selectedRecipe) return
    if (type === 'add'){
      navigate(`/app/recipes/select`, {state: {path: `/app/meal-plans/${meal_planID}/edit`, currentData: currentData, selectedRecipe: selectedRecipe} })
    } else if (type === 'rem') {
      setCurrentData(exchangeMealPlanData(currentData, selectedRecipe, null))
    }
  }, [selectedRecipe, type])

  // Saving
  const [updateMealPlan, {isSuccess: isUpdateMealPlanSuccess}] = useUpdateMealPlanMutation()
  
  const onSaveButtonClicked = (e) => {
    e.preventDefault()
    const options = currentData.meal_plan
    delete options.meal_planID
    delete options.active
    delete options.userID
    updateMealPlan({userID, options, meal_planID: meal_planID})
  }

  useEffect(() => {
    if (isUpdateMealPlanSuccess) {
      navigate('/app/meal-plans')
    }
  }, [isUpdateMealPlanSuccess])

  return (
    <>
      {display &&
        <CreateEditMealPlanCommon 
          currentData={currentData} 
          setCurrentData={setCurrentData} 
          setSelectedRecipe={setSelectedRecipe} 
          setType={setType} 
          name={'Edit Meal Plan'} 
          onSaveButtonClicked={onSaveButtonClicked}
          changesMade={!_.isEqual(getUserMealPlanData, currentData)}/>
      }
    </>
  )
}

export default EditMealPlan