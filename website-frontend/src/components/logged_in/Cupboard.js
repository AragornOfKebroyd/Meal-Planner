import './Cupboard.css'
import { useSelector } from 'react-redux'
import React, { useEffect, useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faTrashCan, faPlusCircle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import { selectCurrentUser } from '../../app/state/authSlice'
import { useGetCupboardItemsQuery, useUpdateCupboardItemsMutation } from '../../app/services/usersApiSlice'
import { useSearchFromIngredientsMutation } from '../../app/services/recipesApiSlice'

import Modal from '../common/Modal'
import Spinner from '../common/Spinner'
import { selectIngredients } from '../../app/state/recipeDataSlice'
import ConfirmationModal from '../common/modals/ConfirmationModal'
import SearchRecipeIcon from '../common/recipe icons/SearchRecipeIcon'
import { useNavigate } from 'react-router-dom'
import SearchRecipeIconLarge from '../common/recipe icons/SearchRecipeIconLarge'

const COLUMNS_SMALL = 8
const COLUMNS_BIG = 2

const Cupboard = () => {
  const [modalContent, setModalContent] = useState()
  const [showModal, setShowModal] = useState(false)
  const allIngredients = useSelector(selectIngredients)
  const userID = useSelector(selectCurrentUser).userID
  const navigate = useNavigate()

  const [saveCupboard, {isError: isUpdateUserCupboardError}] = useUpdateCupboardItemsMutation()
  
  const {data: cupboardItemsData, isSuccess: isCupboardItemsSuccess} = useGetCupboardItemsQuery({userID})
  const [cupboardState, setCupboardState] = useState([])

  // Set cupboard state when it loads
  useEffect(() => {
    if (isCupboardItemsSuccess){
      setCupboardState(cupboardItemsData.map(item => ({...item, include: false})))
    }
  }, [isCupboardItemsSuccess, cupboardItemsData])

  // All below is copy and paste and so needs to be changed
  const [cupboardIngredientName, setCupboardIngredientName] = useState('')
  const [cupboardIngredientSearch, setCupboardIngredientSearch] = useState('')
  const [cupboardIngs, setCupboardIngs] = useState([])
  const [ingOptions, setIngOptions] = useState([])
  const [editing, setEditing] = useState(false)
  
  const editCupboardItemClicked = (e, ingredient) => {
    setCupboardIngredientName(ingredient.name)
    setEditing(ingredient.name)
    setCupboardIngredientSearch('')
    setCupboardIngs(allIngredients.filter(ing => ingredient.ingredientIDs.includes(ing.ingredientID)))
    setIngOptions(allIngredients.filter(ing => cupboardIngs.includes(ing) === false).slice(0,10))
    setModalContent('cupboard-ingredient')
    setShowModal(true)
  }

  const deleteCupboardItemClicked = (e, ingredient) => {
    setEditing(ingredient.name)
    setModalContent('are-you-sure')
    setShowModal(true)
  }

  const deleteIngredient = (e) => {
    e.preventDefault()
    const cupboard = cupboardState.filter(ing => ing.name !== editing)
    setCupboardState(cupboard)
    setShowModal(false)
  }

  const newCupboardItemClicked = async (e) => {
    setEditing('')
    setCupboardIngredientName('')
    setCupboardIngredientSearch('')
    setCupboardIngs([])
    setIngOptions(allIngredients.slice(0,10))
    setModalContent('cupboard-ingredient')
    setShowModal(true)
  }

  const cupboardIngredientNameChanged = (e) => {
    setCupboardIngredientName(e.target.value)
    cupboardSearchChanged(e)
  }

  const cupboardSearchChanged = (e) => {
    setCupboardIngredientSearch(e.target.value)
    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 && cupboardIngs.includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const cupboardIngChosen = (e, ingredient) => {
    e.preventDefault()
    setCupboardIngs([...cupboardIngs, ingredient])
    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(cupboardIngredientSearch.toLowerCase()) !== -1 && [...cupboardIngs, ingredient].includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const cupboardIngRemoved = (e, ingredient) => {
    e.preventDefault()
    const newIngs = cupboardIngs.filter(ing => ing !== ingredient)
    setCupboardIngs(newIngs)
    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(cupboardIngredientSearch.toLowerCase()) !== -1 && newIngs.includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const cupboardIngredientsSaveClicked = (e) => {
    e.preventDefault()
    var cupboard
    if (editing) {
      const targetIng = cupboardState.find(ing => ing.name === editing)
      if (!targetIng) {
        setEditing(false)
        setShowModal(false)
        return console.error(`nothing found with the name ${editing}`)
      }
      cupboard = cupboardState.map(ingredient => {
        if (ingredient.name === editing) {
          return {...ingredient, 'name': cupboardIngredientName, 'ingredientIDs': cupboardIngs.map(ing => ing.ingredientID), 'ingredientNames': cupboardIngs.map(ing => ing.name).join(', ') }
        }
        return ingredient
      })
    } else { 
      cupboard = [...cupboardState, {'name': cupboardIngredientName, 'ingredientIDs': cupboardIngs.map(ing => ing.ingredientID), 'ingredientNames':cupboardIngs.map(ing => ing.name).join(', ') }]
    }
    // setCupboardState(cupboard) // this will just get refetched
    const realCupboard = cupboard.map(item => {
      const newItem = {...item}
      delete newItem.include
      return newItem
    })
    saveCupboard({userID, cupboard: realCupboard})
    setEditing(false)
    setShowModal(false)
  }

  const toggleIncludeIngredient = (e, ingredientName) => {
    setCupboardState([...cupboardState.map(item => {
      if (item.name === ingredientName) {
        return {...item, include: !item.include}
      }
      return item
    })])
  }

  useEffect(() => {
    if (isUpdateUserCupboardError) {
      console.error('ruh roh')
    }
  }, [isUpdateUserCupboardError])


  // Search for recipes

  const [searchRecipes, { data: searchRecipesData, isSuccess: isSearchRecipesSuccess, isLoading: isSearchRecipesLoading }] = useSearchFromIngredientsMutation()
  const [offset, setOffset] = useState(0)
  const [current, setCurrent] = useState([])
  const [previous, setPrevious] = useState([])
  const [searchIDs, setSearchIDs] = useState([])

  const refresh = () => {
    setOffset(0)
    setCurrent([])
    setPrevious([])
    const ingredientIDs = [].concat(...cupboardState.filter(ingredient => ingredient.include).map(ingredient => ingredient.ingredientIDs))
    setSearchIDs(ingredientIDs)
    const options =  {ingredientIDs, amount: 40, offset: 0}
    if (sortBy !== 'default') {
      options.sortBy = sortBy
    }
    searchRecipes(options)
  }

  const searchRecipesButtonClicked = (e) => {
    e.preventDefault()
    refresh()
  }

  useEffect(() => {
    if (isSearchRecipesSuccess) {
      const newRecipes = [...previous, ...searchRecipesData]
      setCurrent(newRecipes)
    }
  }, [searchRecipesData, isSearchRecipesSuccess])

  // Icon Size
  const [iconSizeBig, setIconSizeBig] = useState(true)

  const iconSizeChanged = (e) => {
    setIconSizeBig(!iconSizeBig)
  }

  const loadMoreButtonClicked = (e) => {
    setPrevious(current)
    e.preventDefault()
    const newOffset = offset + 40
    setOffset(newOffset)
    const options =  {ingredientIDs: searchIDs, amount: 40, offset: newOffset}
    if (sortBy !== 'default') {
      options.sortBy = sortBy
    }
    searchRecipes(options)
  }

  const [sortBy, setSortBy] = useState(null)

  useEffect(() => {
    if (sortBy === null) return
    refresh()
  }, [sortBy])

  const selectRecipe = (recipe) => {
    navigate('/app/meal-plans/select', {state: {recipe, path: '/app/cupboard'}})
  }

  return (
    <main className='cupboard-page'>
      {/* MODAL */}
      <Modal show={showModal} setShow={setShowModal}>
        {/* <form className='modal__form'>
          <h2 htmlFor='excluded_name'>Add Ingredients</h2>
          <input id='excluded_name' type='text' placeholder='Ingredient name' value={excludedIngredientName} onChange={(e) => setExcludedIngredientName(e.target.value)} className='component__input'></input>
          <h3>Accepted</h3>
          <div className='filter-display'>
            {excludedIngs.map(ingredient => <div className='selected_item'><button key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => excludedIngRemoved(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button></div>)}
          </div>
          <input type="text" placeholder="Search.." value={excludedIngredientSearch} onChange={excludedSearchChanged} className='component__input__small recipe-library__tag-input'/>
          <div className='filter-display'>
              {ingOptions.map(ingredient => <button key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => excludedIngChosen(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button>)}
          </div>
          <button type='submit' className='component__small-button component__button-colour-orange' onClick={excludedIngredientsSaveClicked} disabled={
            excludedIngredientName && excludedIngs.length && (ingredientData.excluded_ingredients.map(i => i.name).includes(excludedIngredientName) === false || editing) ? false : true}>Save</button>
          {ingredientData.excluded_ingredients.map(i => i.name).includes(excludedIngredientName) && !editing ? <p>You allready have an excluded ingredient called {excludedIngredientName}</p> : ''}
        </form> */}
      {modalContent === 'cupboard-ingredient' &&
        <form className='modal__form'>
          <h2 htmlFor='excluded_name'>Name</h2>
          <input id='excluded_name' type='text' placeholder='Ingredient name' value={cupboardIngredientName} onChange={cupboardIngredientNameChanged} className='component__input'></input>
          <h3>Accepted</h3>
          <div className='filter-display'>
            {cupboardIngs.map(ingredient => <div className='selected_item'><button type="button" key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => cupboardIngRemoved(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button></div>)}
          </div>
          <input type="text" placeholder="Search.." value={cupboardIngredientSearch} onChange={cupboardSearchChanged} className='component__input__small recipe-library__tag-input'/>
          <div className='filter-display'>
            {ingOptions.map(ingredient => <button type="button" key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => cupboardIngChosen(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button>)}
          </div>
          <button type='submit' className='component__small-button component__button-colour-orange' onClick={cupboardIngredientsSaveClicked} disabled={
            cupboardIngredientName && cupboardIngs.length && (cupboardState.map(i => i.name).includes(cupboardIngredientName) === false || editing) ? false : true}>Save</button>
          {cupboardState.map(i => i.name).includes(cupboardIngredientName) && !editing ? <p>You allready have an excluded ingredient called {cupboardIngredientName}</p> : ''}
        </form>
        }
        {modalContent === 'are-you-sure' &&
          <ConfirmationModal message={`Delete Excluded Ingredient: ${editing}`}onConfirm={deleteIngredient} onCancel={(e) => setShowModal(false)}/>
        }
      </Modal>
      <h2>Cupboard</h2>
      <h3>Ingredients</h3>
      <section className='component__container__wide'>
        <table className='component__table cupboard__table'>
          <thead className='component__table-thead'>
            <tr className='component__table-row component__table-heading'>
              <th className='component__table-item cupboard__table-use'>Use</th>
              <th className='component__table-item cupboard__table-name'>Name</th>
              <th className='component__table-item'>Ingredient List</th>
            </tr>
          </thead>
          {isCupboardItemsSuccess &&
          <tbody className='component__table-tbody'>
            {cupboardState.map(ingredient => {
              return (
                <tr className='component__table-row' key={ingredient.name}>
                  <td className='component__table-item'><input type='checkbox' className='component__checkbox' checked={ingredient.include} onChange={(e) => toggleIncludeIngredient(e, ingredient.name)}/></td>
                  <td className='component__table-item'>{ingredient.name}</td>
                  <td className='component__table-item'>
                    <div className='settings__exlcuded-ingredients__table-ingredients-list'>{ingredient.ingredientNames}</div>
                    <div className='excluded-ingredients__buttons'>
                      <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => editCupboardItemClicked(e, ingredient)} className='excluded-ingredients__button'/>
                      <FontAwesomeIcon icon={faTrashCan} onClick={(e) => deleteCupboardItemClicked(e, ingredient)} className='excluded-ingredients__button excluded-ingredients__button-delete'/>
                    </div>
                  </td>
                </tr>
              )
            })}
            <tr className='component__table-row'>
              <td className='component__table-item'></td>
              <td className='component__table-item'><FontAwesomeIcon icon={faPlusCircle} onClick={newCupboardItemClicked}/></td>
              <td className='component__table-item'></td>
            </tr>
          </tbody>}
        </table>
        <button className='component__large-button component__button-colour-dark-orange' onClick={searchRecipesButtonClicked} disabled={cupboardState.filter(item => item.include).length === 0}>Find Recipes<FontAwesomeIcon icon={faMagnifyingGlass} /></button>
      </section>
      <h3>Results</h3>
      <section className='component__container__wide'>
        {isSearchRecipesLoading && <Spinner />}
        {isSearchRecipesSuccess && <div className='results__header'>
          <div className='result-header__container result-header__iconswitcher'>
            <label className='result-header__iconswitcher-label'>icons:</label>
            <label className="big-small-switch">
              <input type="checkbox" id='switcher' className='hide big-small-checkbox' checked={iconSizeBig} onChange={iconSizeChanged}/>
              <label htmlFor='switcher' className="big-small-toggle" data-off="Small" data-on="Big"/>
            </label>
          </div>
          <div className='result-header__container'>
            <label className='result-header__sortby-label'>sort by: </label>
            <select name="sort" className='result-header__sortby' value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value='default'>Default</option>
              <option value="total_time ASC">Total Time Ascending</option>
              <option value="total_time DESC">Total Time Descending</option>
              <option value="calories ASC">Calories Ascending</option>
              <option value="calories DESC">Calories Descending</option>
              <option value="ratings DESC">Rating</option>
              <option value="yield_number ASC">Servings Ascending</option>
              <option value="yield_number DESC">Servings Descending</option>
            </select>
          </div>
        </div>}
        <div className='results-grid' style={{ gridTemplateColumns: '1fr '.repeat(iconSizeBig ? COLUMNS_BIG : COLUMNS_SMALL), minHeight: '100px' }}>
          {current.map(recipe => 
            <div key={recipe.recipeID} className='recipe-wrapper'>
              {iconSizeBig
                ? <SearchRecipeIconLarge recipe={recipe} selectRecipe={selectRecipe}/>
                : <SearchRecipeIcon recipe={recipe} selectRecipe={selectRecipe}/>
              }
              <p className={`cupboard-result-ingredient-names ${iconSizeBig && 'cupboard-result-ingredient-names-large'}`}>({recipe.IDs.split(',').length}) {recipe.IDs}</p>
              </div>)}
        </div>
        {current.length !== 0 &&
        <button className='component__large-button component__button-colour-orange' onClick={loadMoreButtonClicked}>Load More</button>
        }
      </section>
    </main>
  )
}

export default Cupboard