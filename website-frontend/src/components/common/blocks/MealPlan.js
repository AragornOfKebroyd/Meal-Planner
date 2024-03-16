import RecipeIcon from '../recipe icons/RecipeIcon'
import BlankIcon from '../recipe icons/BlankIcon'
import Spinner from '../Spinner'
import SelectBlankIcon from '../recipe icons/SelectBlankIcon'
import SelectRecipeIcon from '../recipe icons/SelectRecipeIcon'
import SavedRecipeIcon from '../recipe icons/SavedRecipeIcon'
import { faRotate } from '@fortawesome/free-solid-svg-icons'

const MealPlan = ({meal_plan, select, setSelectedRecipe, selectedRecipe}) => { // setSelectedRecipe will only be there is select is there
  const selectRecipe = select || false
  if (!meal_plan) return <Spinner />
  
  const generateIcon = (recipe, path) => {
    if (recipe) {
      return selectRecipe
        ? <SelectRecipeIcon icon={faRotate} recipe={recipe} className='meal-plan-table__item__box' setSelectedRecipe={setSelectedRecipe} path={path} active={selectedRecipe === path || selectedRecipe === ''}/>
        : <SavedRecipeIcon recipe={recipe} className='meal-plan-table__item__box' />
    } else {
      return selectRecipe
        ? <SelectBlankIcon icon={faRotate} className='meal-plan-table__item__box' setSelectedRecipe={setSelectedRecipe} path={path} active={selectedRecipe === path || selectedRecipe === ''}/>
        : <BlankIcon className='meal-plan-table__item__box' />  
    }
  }
  

  const breakfast_row = meal_plan.map((day, i) => <td key={`breakfast:${i}`} className='meal-plan-table__item'>{generateIcon(day.breakfast, `breakfast:${i}`)}</td>)
  const lunch_row = meal_plan.map((day, i) => <td key={`lunch:${i}`} className='meal-plan-table__item'>{generateIcon(day.lunch, `lunch:${i}`)}</td>)
  const dinner_row = meal_plan.map((day, i) => <td key={`dinner:${i}`} className='meal-plan-table__item'>{generateIcon(day.dinner, `dinner:${i}`)}</td>)
  
  return (
    <table className='meal-plan-table' cellSpacing="0" cellPadding="0">
      <thead className='meal-plan-table__head'>
        <tr className='meal-plan-table__row'>
          <th className='meal-plan-table__item'>Monday</th>
          <th className='meal-plan-table__item'>Tuesday</th>
          <th className='meal-plan-table__item'>Wednesday</th>
          <th className='meal-plan-table__item'>Thursday</th>
          <th className='meal-plan-table__item'>Friday</th>
          <th className='meal-plan-table__item'>Saturday</th>
          <th className='meal-plan-table__item'>Sunday</th>
        </tr>
      </thead>
      <tbody className='meal-plan-table__body'>
        <tr className='meal-plan-table__row'>
          {breakfast_row}
        </tr>
        <tr className='meal-plan-table__row'>
          {lunch_row}
        </tr>
        <tr className='meal-plan-table__row'>
          {dinner_row}
        </tr>
      </tbody>
    </table> 
  )
}

export default MealPlan