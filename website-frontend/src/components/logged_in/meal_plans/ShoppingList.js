import { Link, useParams } from 'react-router-dom'
import './ShoppingList.css'
import { useCheckShoppingListItemsMutation, useGetActiveUserMealPlanQuery, useGetUserMealPlanQuery, useLazyGetMealPlanShoppingListQuery } from '../../../app/services/meal_plansApiSlice'
import { selectCurrentUser } from '../../../app/state/authSlice'
import { useSelector } from 'react-redux'
import Spinner from '../../common/Spinner'
import Error from '../../common/Error'
import { useEffect, useRef, useState, Fragment } from 'react'
import { useReactToPrint } from 'react-to-print'
import _ from 'lodash'

const getCorrectFetchMethod = ({active, meal_planID, userID}) => {
  if (active) {
    return [useGetActiveUserMealPlanQuery, {userID}]
  } else {
    return [useGetUserMealPlanQuery, {meal_planID, userID}]
  }
}

const ShoppingList = (props) => {
  const userID = useSelector(selectCurrentUser).userID
  // Different ways of getting the meal plan data based on whether the component is being used for the active meal plan or a specific meal plan
  const active = props?.active || false
  const {meal_planID} = useParams()
  const [useGetMealPlanQuery, options] = getCorrectFetchMethod({active, meal_planID, userID})
  // Get info about the meal plan
  const {data: getMealPlanData, isSuccess: isGetMealPlanSuccess, isError: isGetMealPlanError, error: getMealPlanError} = useGetMealPlanQuery(options)
  
  // Get the shopping list for the meal plan but only do it when we have the info for the meal plan
  const [getShoppingList, {data: getMealPlanShoppingListData, isSuccess: isGetMealPlanShoppingListSuccess}] = useLazyGetMealPlanShoppingListQuery()
  const [currentData, setCurrentData] = useState()
  const [display, setDisplay] = useState(false)

  useEffect(() => {
    if (isGetMealPlanSuccess) {
      const fetched_meal_planID = getMealPlanData.meal_plan.meal_planID
      getShoppingList({meal_planID: fetched_meal_planID, userID})
    }
  }, [isGetMealPlanSuccess])
  
  useEffect(() => {
    if (isGetMealPlanShoppingListSuccess) {
      setCurrentData(getMealPlanShoppingListData)
      setDisplay(true)
    }
  }, [isGetMealPlanShoppingListSuccess])


  const changeIngredientChecked = (e, recipeID, itemID) => {
    const newData = currentData.map(recipe => {
      if (recipe.recipeID !== recipeID) {
        return recipe
      }
      const newIngredients = recipe.ingredients.map(ingredient => {
        if (ingredient.itemID !== itemID) {
          return ingredient
        }
        return {...ingredient, checked: 1 - ingredient.checked}
      })
      return {...recipe, ingredients: newIngredients}
    })
    setCurrentData(newData)
  }


  // Saving
  const [checkItems, {data: getCheckShoppingListItemsData, isSuccess: isGetCheckShoppingListItemsSuccess}] = useCheckShoppingListItemsMutation()

  const saveButtonClicked = (e) => {
    e.preventDefault()
    const checkedIDs = currentData.map(recipe => {
      const checkedIngredients = recipe.ingredients.filter(ingredient => ingredient.checked === 1)
      return checkedIngredients.map(ingredient => ingredient.itemID)
    }).flat()
    checkItems({userID, meal_planID: getMealPlanData.meal_plan.meal_planID, checkedIDs})
  }

  // Reset Button
  const resetClicked = (e) => {
    e.preventDefault()
    const newData = currentData.map(recipe => {
      const newIngredients = recipe.ingredients.map(ingredient => {
        return {...ingredient, checked: 0}
      })
      return {...recipe, ingredients: newIngredients}
    })
    setCurrentData(newData)
  }

  // Discard Button
  const discardClicked = (e) => {
    e.preventDefault()
    setCurrentData(getMealPlanShoppingListData)
  }

  // Print Button
  const printRef = useRef()
  const handlePrint = useReactToPrint({
    content: () => printRef.current
  })


  const changes = () => {
    return !_.isEqual(getMealPlanShoppingListData, currentData)
  }

  return (
    <main className='shopping-list-page' ref={printRef}>
      <h2>{display ? `${getMealPlanData.meal_plan.name} Shopping List` : isGetMealPlanError ? getMealPlanError.status === 404 ? "No Meal Plan" : "Error" : 'Loading...'}</h2>
      {!display 
        ? isGetMealPlanError 
          ? getMealPlanError.status === 404 
            ? <div className='no-meal-plan'>
                <p>You do not have a current meal plan</p>
                <Link to='/app/meal-plans'><button className='component__large-button component__button-colour-dark-orange'>Meal Plans</button> </Link>
              </div>
            : <Error error={getMealPlanError} />
          : <Spinner /> 
        : <>
      <div className='component__button-row'>
        <button className='component__large-button component__button-colour-dark-orange' onClick={resetClicked}>Reset</button> 
        <button className='component__large-button component__button-colour-save' onClick={saveButtonClicked} disabled={!changes()}>Save</button> 
        <button className='component__large-button component__button-colour-discard' onClick={discardClicked} disabled={!changes()}>Discard</button> 
        <button className='component__large-button component__button-colour-blue' onClick={handlePrint}>Print</button>
      </div>
      {changes() ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
      <section className='component__container__wide'>
        <table className='component__table shopping-list__table'>
          <thead className='component__table-thead'>
            <tr className='component__table-row component__table-heading'>
              <th className='component__table-item shopping-list__table-have'>Have</th>
              <th className='component__table-item shopping-list__table-ingredient'>Ingredient</th>
              <th className='component__table-item shopping-list__table-count'>Count</th>
            </tr>
          </thead>
          <tbody className='component__table-tbody'>
            {currentData.map(recipe => {
              return ( <Fragment key={recipe.recipeID}>
                <tr className='component__table-row'>
                  <td colSpan='3' className='component__table-item shopping-list-dividers'>{recipe.title}</td>
                </tr>
                {recipe.ingredients.map(ingredient => {
                  return (
                    <tr className='component__table-row' key={ingredient.itemID}>
                      <td className='component__table-item'><input type='checkbox' checked={ingredient.checked} onChange={(e) => changeIngredientChecked(e, recipe.recipeID, ingredient.itemID)} className="component__checkbox"/></td>
                      <td className={`component__table-item ${ingredient.checked ? 'stikethrough' : ''}`}>{ingredient.ingredient}</td>
                      <td className='component__table-item'>{recipe.count}</td>
                    </tr>
                  )
                })}
              </Fragment>)
            })}
          </tbody>
        </table>
      </section>
      {changes() ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
      <div className='component__button-row'>
        <button className='component__large-button component__button-colour-dark-orange' onClick={resetClicked}>Reset</button> 
        <button className='component__large-button component__button-colour-save' onClick={saveButtonClicked} disabled={!changes()}>Save</button> 
        <button className='component__large-button component__button-colour-discard' onClick={discardClicked} disabled={!changes()}>Discard</button> 
        <button className='component__large-button component__button-colour-blue' onClick={handlePrint}>Print</button>
      </div>
      </>}
    </main>
  )
}

export default ShoppingList