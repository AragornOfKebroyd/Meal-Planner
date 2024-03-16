import { useSelector } from 'react-redux'
import { useGetUserMealPlanQuery, useSetActiveMealPlanMutation } from '../../../app/services/meal_plansApiSlice'
import './ViewMealPlan.css'
import { Link, useParams } from 'react-router-dom'
import { selectCurrentUser } from '../../../app/state/authSlice'
import { useReactToPrint } from 'react-to-print';
import RecipeIcon from '../../common/recipe icons/RecipeIcon'
import BlankIcon from '../../common/recipe icons/BlankIcon'
import { useRef } from 'react'

// TODO make a new icon for this page which is bigger.

const DAY_MATCHER = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thurday',
  4: 'Friday',
  5: 'Satday',
  6: 'Sunday'
}

const ViewMealPlan = () => {
  const userID = useSelector(selectCurrentUser).userID
  const { meal_planID } = useParams()

  const {data: getUserMealPlanData, isSuccess: isGetUserMealPlanSuccess} = useGetUserMealPlanQuery({userID, meal_planID})
  const [setActiveMealPlan, {isSuccess: isSetActiveMealPlanSuccess, isLoading: isSetActiveMealPlanLoading }] = useSetActiveMealPlanMutation()

  const setActiveClicked = (e) => {
    e.preventDefault()
    setActiveMealPlan({userID, meal_planID: getUserMealPlanData.meal_plan.meal_planID})
  }

  const printRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => printRef.current
  })

  return (
    <main className='view-meal-plan-page' ref={printRef}>
      <h2>{isGetUserMealPlanSuccess && getUserMealPlanData.meal_plan.name}</h2>
      {isGetUserMealPlanSuccess &&
      <div className='component__button-row'>
        <Link to={`/app/meal-plans/${meal_planID}/edit`}><button className='component__large-button component__button-colour-orange'>Edit</button></Link>
        <Link to={`/app/shopping-list/${meal_planID}`}><button className='component__large-button component__button-colour-orange'>Shopping List</button></Link>
        <button className='component__large-button component__button-colour-dark-orange' disabled={getUserMealPlanData.meal_plan.active} onClick={setActiveClicked}>Set As Current</button>
        <button className='component__large-button component__button-colour-blue' onClick={handlePrint}>Print</button>
      </div>
      }
      <section className='component__container__wide'>
        {isGetUserMealPlanSuccess &&
          Object.keys(getUserMealPlanData.formatted).map((day_number, n) => {
            const day_recipes = getUserMealPlanData.formatted[day_number]
            const breakfast = day_recipes?.breakfast
            const lunch = day_recipes?.lunch
            const dinner = day_recipes?.dinner
            const day = DAY_MATCHER[n]
            return <div key={n} className='view_recipe_day'>
              <h3>{day === 'Thurday' ? 'Thursday' : day}</h3>
              <section className='component__container__wide view_recipe_day_compartment'>
                {breakfast ? <RecipeIcon recipe={breakfast} /> : <BlankIcon />}
                {lunch ? <RecipeIcon recipe={lunch} /> : <BlankIcon />}
                {dinner ? <RecipeIcon recipe={dinner} /> : <BlankIcon />}
              </section>
            </div>
          })
        }
      </section>
      <div className='component__button-row'>
        <Link to={`/app/meal-plans/${meal_planID}/edit`}><button className='component__large-button component__button-colour-orange'>Edit</button></Link>
        <Link to={`/app/shopping-list/${meal_planID}`}><button className='component__large-button component__button-colour-orange'>Shopping List</button></Link>
        <button className='component__large-button component__button-colour-dark-orange'>Set As Current</button>
        <button className='component__large-button component__button-colour-blue' onClick={handlePrint}>Print</button>
      </div>
    </main>
  )
}

export default ViewMealPlan