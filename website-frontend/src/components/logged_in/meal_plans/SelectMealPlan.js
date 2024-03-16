import { useSelector } from 'react-redux'
import { useGetAllUserMealPlansQuery, useUpdateMealPlanMutation } from '../../../app/services/meal_plansApiSlice'
import './SelectMealPlan.css'

import { useEffect, useState } from 'react'
import { selectCurrentUser } from '../../../app/state/authSlice'
import Spinner from '../../common/Spinner'
import MealPlan from '../../common/blocks/MealPlan'
import MealPlanIcon from '../../common/MealPlanIcon'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const DAY_MATCHER = {
  0: 'monday',
  1: 'tuesday',
  2: 'wednesday',
  3: 'thurday',
  4: 'friday',
  5: 'satday',
  6: 'sunday'
}

const SelectMealPlan = () => {
  const {state} = useLocation()
  const navigate = useNavigate()

  const userID = useSelector(selectCurrentUser).userID

  const {data: getMealPlansData, isSuccess: isGetUserMealPlansSuccess} = useGetAllUserMealPlansQuery(userID)

  const [currentPlan, setCurrentPlan] = useState([])
  const [currentPlanData, setCurrentPlanData] = useState({})
  const [display, setDisplay] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState('')

  useEffect(() => {
    if (isGetUserMealPlansSuccess) {
      setDisplay(true)
    }
  }, [isGetUserMealPlansSuccess])

  useEffect(() => {
    if (isGetUserMealPlansSuccess) {
      const active = getMealPlansData.formatted[currentPlanData.meal_planID]
      setCurrentPlan(active)
      setSelectedRecipe('')
    }
  }, [currentPlanData])

  const [updateMealPlan, {isSuccess: isUpdateMealPlanSuccess}] = useUpdateMealPlanMutation()

  const mealPlanSelected = (e) => {
    e.preventDefault()
    const [meal, day] = selectedRecipe.split(':')
    const optionName = `${DAY_MATCHER[day]}_${meal}`
    const options = {[optionName]: state.recipe.recipeID}
    updateMealPlan({userID, options, meal_planID: currentPlanData.meal_planID})
    navigate(state.path, {state: state})
  }

  return (
    <main className='meal-plan-library-page'>
      <h2>Select Recipe Slot</h2>
      <section className='component__container__wide meal-plan-library__meal-plan-icons'>
        {display
          ? <>
              {getMealPlansData.meal_plans.map((meal_plan, n) => 
              <div key={n}>
                <MealPlanIcon mealPlanData={meal_plan} setCurrentPlanData={setCurrentPlanData} 
                  active={meal_plan.active} 
                  selected={meal_plan.meal_planID === currentPlanData.meal_planID} 
                  greyed={meal_plan.meal_planID !== currentPlanData.meal_planID && Object.keys(currentPlanData).length}/>
              </div>)}
              {getMealPlansData.meal_plans.length === 0 &&
                <div className='no-meal-plan'>
                  <p>You do not have any meal plans to add this too.</p>
                  <Link to={`/app/meal-plans/create`}><button className='add-new-meal-plan-button'>+</button></Link>
                </div> 
              }
            </>
          : <Spinner />
        }
      </section>
      <h3>{display ? currentPlanData.name : 'Loading...'}</h3>
      <section className='component__container__wide'>
        {display
          ? Object.keys(currentPlanData).length 
            ? <MealPlan meal_plan={currentPlan} select={true} setSelectedRecipe={setSelectedRecipe} selectedRecipe={selectedRecipe}/>
            : <p>Select Recipe</p>
          : <Spinner />
        }
      </section>
      {display && <>
      <div className='component__button-row'>
        <button className='component__large-button component__button-colour-dark-orange' disabled={selectedRecipe === ''} onClick={mealPlanSelected}>Select</button>
      </div>
      </>}
    </main>
  )
}

export default SelectMealPlan