import './CreateMealPlan.css'
import ExchangeRecipeIcon from '../../common/recipe icons/ExchangeRecipeIcon'
import ExchangeBlankIcon from '../../common/recipe icons/ExchangeBlankIcon'
import { Link } from 'react-router-dom'

const DAY_MATCHER = {
  0: 'monday',
  1: 'tuesday',
  2: 'wednesday',
  3: 'thurday',
  4: 'friday',
  5: 'saturday',
  6: 'sunday'
}

export const exchangeMealPlanData = (currentData, selectedRecipe, newitem) => {
  return {
    formatted: currentData.formatted.map((day, n) => {
      if (n === Number(selectedRecipe.split(':')[1])) {
        return {...day, [selectedRecipe.split(':')[0]]: newitem}
      } else {
        return day
      }
    }),
    meal_plan: {
      ...currentData.meal_plan, 
      [`${DAY_MATCHER[selectedRecipe.split(':')[1]]}_${selectedRecipe.split(':')[0]}`]: newitem?.recipeID || null
    }
  }
}

const CreateEditMealPlanCommon = ({ currentData, setCurrentData, setSelectedRecipe, setType, name, onSaveButtonClicked, changesMade }) => {  
  return (
    <main className='view-meal-plan-page'>
      <h2>{name}</h2>
      <div className='component__button-row'>
        <button onClick={onSaveButtonClicked} disabled={currentData.meal_plan.name === '' || !changesMade} className='component__large-button component__button-colour-save'>Save</button>
        <Link to='/app/meal-plans'><button className='component__large-button component__button-colour-discard'>Discard</button></Link>
      </div>
      {changesMade ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
      <section className='component__container__wide'>
        <label className='component__input__label'>Meal Plan Name:</label>
        <input value={currentData.meal_plan.name} placeholder="(required)" onChange={(e) => setCurrentData({...currentData, meal_plan: {...currentData.meal_plan, name: e.target.value}})} className='component__input'/>
        {
          Object.keys(currentData.formatted).map((day_number, n) => {
            const day_recipes = currentData.formatted[day_number]
            const breakfast = day_recipes?.breakfast
            const lunch = day_recipes?.lunch
            const dinner = day_recipes?.dinner
            const day = DAY_MATCHER[n]
            return <div key={n} className='view_recipe_day'>
              <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
              <section className='component__container__wide view_recipe_day_compartment'>
                {breakfast ? <ExchangeRecipeIcon recipe={breakfast} setSelectedRecipe={setSelectedRecipe} setType={setType} path={`breakfast:${Number(day_number)}`} active={true}/> : <ExchangeBlankIcon setSelectedRecipe={setSelectedRecipe} setType={setType} path={`breakfast:${Number(day_number)}`} active={true}/>}
                {lunch ? <ExchangeRecipeIcon recipe={lunch} setSelectedRecipe={setSelectedRecipe} setType={setType} path={`lunch:${Number(day_number)}`} active={true}/> : <ExchangeBlankIcon setSelectedRecipe={setSelectedRecipe} setType={setType} path={`lunch:${Number(day_number)}`} active={true}/>}
                {dinner ? <ExchangeRecipeIcon recipe={dinner} setSelectedRecipe={setSelectedRecipe} setType={setType} path={`dinner:${Number(day_number)}`} active={true}/> : <ExchangeBlankIcon setSelectedRecipe={setSelectedRecipe} setType={setType} path={`dinner:${Number(day_number)}`} active={true}/>}
              </section>
            </div>
          })
        }
      </section>
      {changesMade ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
      <div className='component__button-row'>
        <button onClick={onSaveButtonClicked} disabled={currentData.meal_plan.name === '' || !changesMade} className='component__large-button component__button-colour-save'>Save</button>
        <Link to='/app/meal-plans'><button className='component__large-button component__button-colour-discard'>Discard</button></Link>
      </div>
    </main>
  )
}

export default CreateEditMealPlanCommon