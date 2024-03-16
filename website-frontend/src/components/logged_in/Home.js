import './Home.css'

import { Link } from 'react-router-dom'

import { useGetActiveUserMealPlanQuery } from '../../app/services/meal_plansApiSlice'
import { useGetRecipeQuery } from '../../app/services/recipesApiSlice'

import { fetchRecipeData } from '../../app/state/recipeDataSlice'
import { fetchUserData } from '../../app/state/userDataSlice'

import RecipeIcon from '../common/recipe icons/RecipeIcon'
import BlankIcon from '../common/recipe icons/BlankIcon'
import Spinner from '../common/Spinner'
import Error from '../common/Error'

import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser } from '../../app/state/authSlice'
import { useEffect } from 'react'
import MealPlan from '../common/blocks/MealPlan'

const Home = () => {
  const dispatch = useDispatch()

  // Fetch Data on page load
  useEffect(() => {
    dispatch(fetchUserData())
    dispatch(fetchRecipeData())
  }, [])


  const userID = useSelector(selectCurrentUser).userID

  // Active Meal Plan
  const {data: meal_plan, isLoading: isGetUserMealPlansLoading, isSuccess: isGetUserMealPlansSuccess, isError: isGetUserMealPlansError, error: getUserMealPlansError} 
    = useGetActiveUserMealPlanQuery({userID})

  const activeMealPlan = isGetUserMealPlansSuccess
    ? <MealPlan meal_plan={Object.values(meal_plan.formatted)[0]} />
    : isGetUserMealPlansLoading 
      ? <Spinner />
      : isGetUserMealPlansError && getUserMealPlansError?.data?.message === 'No Active Meal Plan'
        ? <>
            <p className='home-page__meal-plan-add-if-none__text-top'>You haven't got an active meal plan.</p>
            <Link to='/app/meal-plans'><button className='component__large-button home-page__meal-plan-add-if-none'>+</button></Link>
            <p className='home-page__meal-plan-add-if-none__text-bottom'>Create One!</p>
          </>
        : getUserMealPlansError.status === 404
          ? <div className='no-meal-plan'>
              <p>You do not have a current meal plan</p>
              <Link to='/app/meal-plans'><button className='component__large-button component__button-colour-dark-orange'>Meal Plans</button> </Link>
            </div>
          : <Error error={getUserMealPlansError} />

  // Recipes You Might Like [TODO]

  const {data: recipe, isLoading: isGetRecipeLoading, isSuccess: isGetRecipeSuccess, isError: isGetRecipeError, error: getRecipeError} = useGetRecipeQuery({recipeID: 20, userID})
  
  return (
    <main className='home-page'>
      <h2>Home</h2>
      <h3>Current Meal Plan</h3>
      <section className='component__container__wide'>
        {activeMealPlan}
      </section>
      {isGetUserMealPlansSuccess &&
      <div className='component__button-row home-page__meal-plan-buttons'>
        <Link to={`/app/meal-plans/${meal_plan.meal_plan.meal_planID}/edit`}><button className='component__large-button component__button-colour-orange'>Edit</button></Link>
        <Link to={`/app/meal-plans/${meal_plan.meal_plan.meal_planID}`}><button className='component__large-button component__button-colour-orange'>Open</button></Link>
        <Link to={`/app/meal-plans`}><button className='component__large-button component__button-colour-orange'>Change</button></Link>
      </div>}

      {/* <h3>Recipes You Might Like</h3>
      <section className='component__container__wide'>
        {isGetRecipeLoading
          ? <Spinner />
          : isGetRecipeError
            ? <Error error={getRecipeError} />
            : isGetRecipeSuccess
              ? <div className='home-page__suggested-recipes'>{
                  [...Array(7).keys()].map(n => <RecipeIcon recipe={recipe.recipe} key={n} className='meal-plan-table__item__box' />)
                }</div>
              : ''
        }
        <button className='component__large-button component__button-colour-orange'>Load More</button>
      </section> */}
    </main>
  )
}

export default Home