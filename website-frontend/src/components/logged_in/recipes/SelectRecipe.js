import { Link, useLocation, useNavigate } from 'react-router-dom'
import './SelectRecipe.css'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useGetSavedAndUserRecipesQuery, useSearchRecipesMutation } from '../../../app/services/recipesApiSlice'
import { removeFromTagList, selectCurrentUser, selectUserTags, updateTagList } from '../../../app/state/authSlice'
import { useAddTagMutation, useRemoveTagMutation } from '../../../app/services/usersApiSlice'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faMagnifyingGlass, faTrash } from '@fortawesome/free-solid-svg-icons'
import { prepIngredientOptionsSettings, prepRecipeOptionsSettings } from '../../../functionality/prepSearchOptions'
import { dataFetched } from '../../../app/state/userDataSlice'
import SearchFilters from '../../common/blocks/SearchFilters'
import Spinner from '../../common/Spinner'
import SelectRecipeIcon from '../../common/recipe icons/SelectRecipeIcon'
import _ from 'lodash'
import SelectUserRecipeIcon from '../../common/recipe icons/SelectUserRecipeIcon'

const RECIPES_PER_PAGE = 80
const COLUMNS = 8

const SelectRecipe = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const navigate = useNavigate()
  const {state} = useLocation()

  const [selectedRecipe, setSelectedRecipe] = useState(null)

  const recipeSelected = (e) => {
    e.preventDefault()
    navigate(state.path, {state: {...state, recipe: selectedRecipe}})
  }

  // User recipes

  const userID = useSelector(selectCurrentUser).userID
  const { data: getUserSavedRecipeData, isSuccess: isGetUserSavedRecipeSuccess } = useGetSavedAndUserRecipesQuery({userID, IDsOnly: false})

  const MyRecipes = ({getUserSavedRecipeData}) => {
    const filteredRecipes = getUserSavedRecipeData.filter(recipe => recipe.user_recipe === 1)
  
    const BATCH_SIZE = 24
  
    const [showLoadMore, setShowLoadMore] = useState(filteredRecipes.length > BATCH_SIZE)
    const [showAmount, setShowAmount] = useState(BATCH_SIZE)
  
    const loadMoreClicked = () => {
      setShowAmount(showAmount + BATCH_SIZE)
      if (showAmount + BATCH_SIZE >= filteredRecipes.length) {
        setShowLoadMore(false)
      }
    }
  
    return (
      <>
        <div className='results-grid' style={{ gridTemplateColumns: '1fr '.repeat(8) }}>
          {
            filteredRecipes.slice(0, showAmount).map(recipe => <SelectUserRecipeIcon key={recipe.recipeID} recipe={recipe} setSelectedRecipe={setSelectedRecipe} path={recipe} active={_.isEqual(selectedRecipe, recipe) || selectedRecipe === null}/>)
          }
        </div>
        {showLoadMore &&
          <button className='component__large-button component__button-colour-orange' onClick={loadMoreClicked}>Load More <FontAwesomeIcon icon={faChevronDown}/></button>
        }
      </>
    )
  }
  
  const SavedRecipes = ({getUserSavedRecipeData}) => {
    const filteredRecipes = getUserSavedRecipeData.filter(recipe => recipe.user_recipe === 0)
  
    const BATCH_SIZE = 24
  
    const [showLoadMore, setShowLoadMore] = useState(filteredRecipes.length > BATCH_SIZE)
    const [showAmount, setShowAmount] = useState(BATCH_SIZE)
  
    const loadMoreClicked = () => {
      setShowAmount(showAmount + BATCH_SIZE)
      if (showAmount + BATCH_SIZE >= filteredRecipes.length) {
        setShowLoadMore(false)
      }
    }
  
    return (
      <>
        <div className='results-grid' style={{ gridTemplateColumns: '1fr '.repeat(8) }}>
          {
            filteredRecipes.slice(0, showAmount).map(recipe => <SelectRecipeIcon key={recipe.recipeID} recipe={recipe} setSelectedRecipe={setSelectedRecipe} path={recipe} active={_.isEqual(selectedRecipe, recipe) || selectedRecipe === null}/>)
          }
        </div>
        {showLoadMore &&
          <button className='component__large-button component__button-colour-orange' onClick={loadMoreClicked}>Load More <FontAwesomeIcon icon={faChevronDown}/></button>
        }
      </>
    )
  }

  const recipeLibrary = <>
      <h3>My Recipes</h3>
      <section className='component__container__wide'>
        {isGetUserSavedRecipeSuccess &&
          <MyRecipes getUserSavedRecipeData={getUserSavedRecipeData}/>
        }
      </section>

      <h3>Saved Recipes</h3>
      <section className='component__container__wide'>
        {isGetUserSavedRecipeSuccess &&
          <SavedRecipes getUserSavedRecipeData={getUserSavedRecipeData}/>
        }
      </section>
      <button className='component__large-button component__button-colour-dark-orange' disabled={selectedRecipe === ''} onClick={recipeSelected}>Select</button>
    </>





  // Search Recipes

  const [searchRecipes, {data: searchRecipesData, isLoading: isSearchRecipesLoading, isSuccess: isSearchRecipesSuccess}] = useSearchRecipesMutation()
  
  const userData = useSelector((state) => state.auth.userData)

  const [searchOptions, setSearchOptions] = useState({
    recipeOptions:prepRecipeOptionsSettings(userData), 
    ingredientOptions:prepIngredientOptionsSettings(userData), 
    categoryOptions:{}, 
    cuisineOptions:{}, 
    amount:RECIPES_PER_PAGE, 
    offset: 0})
  
  const [searchInput, setSearchInput] = useState('')

  const searchInputChanged = (e) => {
    setSearchInput(e.target.value)
    setSearchOptions({...searchOptions, recipeOptions: {...searchOptions.recipeOptions, title: e.target.value}})
  }

  const [refresh, setRefresh] = useState(false)
  
  useEffect(() => {
    if (refresh) {
      setCurrentPage(1)
      searchRecipes(searchOptions)
      setRefresh(false)
    }
  }, [refresh])

  const searchRecipesButtonClicked = (e) => {
    e.preventDefault()
    setRefresh(true)
  }

  const [filtersDropdown, setFiltersDropdown] = useState(state ? state.filtersDropdown : false)
  const toggleFiltersDropdown = (e) => setFiltersDropdown(!filtersDropdown)

  // pagination
  const [pages, setPages] = useState(state ? state.pages : 0)
  const [currentPage, setCurrentPage] = useState(state ? state.currentPage : 1)
  const [pageSearch, setPageSearch] = useState(state ? state.pageSearch :'')

  useEffect(() => {
    if (isSearchRecipesSuccess) {
      const results = searchRecipesData.count.total
      setPages(Math.ceil(results / RECIPES_PER_PAGE))
    }
  }, [isSearchRecipesSuccess, searchRecipesData])

  const pageChanged = (toPage) => {
    const newSearchOptions = {...searchOptions, offset: RECIPES_PER_PAGE * (toPage - 1)}
    setSearchOptions(newSearchOptions)
    searchRecipes(newSearchOptions)
    setCurrentPage(toPage)
  }

  const pagination = 
    <div className='results-pagination'>
      <div className='results-pagination-bar'>
        {pages < 10 
          ? Array.from({length: pages}).map((_, n) => <p key={n} className={`results-pagination-item ${n+1 === currentPage ? 'active' : ''}`} onClick={(e) => pageChanged(n+1)}>{n+1}</p>)
          : Array.from({length: 10}).map((_, n) => {
            // Logic for setting what each block n should be on the pagination based on the current page and total number of pages
            if (n + 1 === 9) {
              return <form key={n} className='results-pagination-item' onSubmit={(e) => {
                e.preventDefault()
                if (e.target.pagesearch.value) pageChanged(Number(e.target.pagesearch.value))
                setPageSearch('')
              }}><input type='number' name='pagesearch' min='1' max={pages} step='1' key={n} className='results-pagination-search' placeholder='...' value={pageSearch} onChange={(e) => setPageSearch(e.target.value)}/></form>
            }
            var value
            if (currentPage <= 5) {
              value = n+1
            } else if (currentPage >= pages - 3) {
              value = n+pages-8
            } else {
              value = n+currentPage-4
            }
            if (n + 1 === 10) {
              value = pages
            }
            return <p key={n} className={`results-pagination-item ${value === currentPage ? 'active' : ''}`} onClick={(e) => pageChanged(value)}>{value}</p>
          })
        }
      </div>
    </div>

  // Sort By
  const [sortBy, setSortBy] = useState(null)

  useEffect(() => {
    if (sortBy === null) return
    if (sortBy === 'default') {
      setSearchOptions({...searchOptions, sortBy: null})
    } else {
      setSearchOptions({...searchOptions, sortBy: sortBy})
    }
    setRefresh(true)
  }, [sortBy])

  const search = <>
      <h3>Search Recipes</h3>
      <input type='search' className='component__search' placeholder='Search Over 250,000 Recipes' value={searchInput} onChange={searchInputChanged}/>
      
      {/* Filters */}
      <h3>Filters<FontAwesomeIcon icon={faChevronDown} onClick={toggleFiltersDropdown} className={`options-header-arrow ${!filtersDropdown ? 'options-header-arrow-up' : ''}`}/></h3>
      {useSelector(dataFetched) ? 
      <form className='search-filters-form'>
        <SearchFilters searchOptions={searchOptions} setSearchOptions={setSearchOptions} className={filtersDropdown ? '' : 'hide'}/>
        <button className='component__large-button component__button-colour-dark-orange' onClick={searchRecipesButtonClicked}>Find Recipes<FontAwesomeIcon icon={faMagnifyingGlass} /></button>
      </form>
      : <Spinner />}

      {/* Results */}
      <h3>Results</h3>
      <section className='component__container__wide results'>
        {isSearchRecipesSuccess && 
        <div className='results__header'>
          <div className='result-header__container'>
            <p className='resultcount'>{searchRecipesData.count.total} Results</p>
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
        {isSearchRecipesLoading ? <Spinner /> :
        !isSearchRecipesSuccess ? <p>Search For Recipes</p> :
        <div className='results__body'>
          {pagination}
          <div className='results-grid' style={{ gridTemplateColumns: '1fr '.repeat(COLUMNS) }}>
            {isSearchRecipesSuccess &&
            searchRecipesData.recipes.map(recipe => <SelectRecipeIcon key={recipe.recipeID} recipe={recipe} setSelectedRecipe={setSelectedRecipe} path={recipe} active={_.isEqual(selectedRecipe, recipe) || selectedRecipe === null}/>)}
          </div>
          {pagination}
        </div>}
      </section>
      <button className='component__large-button component__button-colour-dark-orange' disabled={selectedRecipe === ''} onClick={recipeSelected}>Select</button>
    </>  

  return (
    <main className='select-recipe-page'>
      {recipeLibrary}
      {search}
    </main>
  )
}

export default SelectRecipe