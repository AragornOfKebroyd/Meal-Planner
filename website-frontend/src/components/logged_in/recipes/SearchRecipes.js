import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faChevronDown } from '@fortawesome/free-solid-svg-icons'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { prepRecipeOptionsSettings, prepIngredientOptionsSettings } from '../../../functionality/prepSearchOptions';

import { useSearchRecipesMutation } from '../../../app/services/recipesApiSlice'
import Spinner from '../../common/Spinner'
import SearchRecipeIcon from '../../common/recipe icons/SearchRecipeIcon'

import './SearchRecipes.css'
import SearchFilters from '../../common/blocks/SearchFilters'
import { dataFetched } from '../../../app/state/recipeDataSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchRecipeIconLarge from '../../common/recipe icons/SearchRecipeIconLarge';

const RECIPES_PER_PAGE = 80
const COLUMNS_SMALL = 8
const COLUMNS_BIG = 2

const SearchRecipes = () => {
  const navigate = useNavigate()

  const [searchRecipes, {data: searchRecipesData, isLoading: isSearchRecipesLoading, isSuccess: isSearchRecipesSuccess}] = useSearchRecipesMutation()
  
  const userData = useSelector((state) => state.auth.userData)
  const loc = useLocation()
  const state = loc.state ? loc.state : {}
  const [searchOptions, setSearchOptions] = useState( state.searchOptions ? state.searchOptions : {
    recipeOptions:prepRecipeOptionsSettings(userData), 
    ingredientOptions:prepIngredientOptionsSettings(userData), 
    categoryOptions:{}, 
    cuisineOptions:{}, 
    amount:RECIPES_PER_PAGE, 
    offset: 0,
    sortBy: null})
  
  const [searchInput, setSearchInput] = useState(state.searchInput ? state.searchInput : '')

  const searchInputChanged = (e) => {
    setSearchInput(e.target.value)
    setSearchOptions({...searchOptions, recipeOptions: {...searchOptions.recipeOptions, title: e.target.value}})
  }

  const keyOnSearchEntered = (e) => {
    if (e.key === 'Enter') {
      setRefresh(true)
    }
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

  const selectRecipe = (recipe) => {
    navigate('/app/meal-plans/select', {state: {recipe, searchOptions, searchInput, filtersDropdown, pages, currentPage, pageSearch, path: '/app/search'}})
  }

  // Icon Size
  const [iconSizeBig, setIconSizeBig] = useState(true)

  const iconSizeChanged = (e) => {
    setIconSizeBig(!iconSizeBig)
  }

  return (
    <main className='search-recipes-page'>
      <h2>Search Recipes</h2>
      <input type='search' className='component__search' placeholder='Search Over 250,000 Recipes' value={searchInput} onChange={searchInputChanged} onKeyDown={keyOnSearchEntered}/>
      
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
        {isSearchRecipesLoading ? <Spinner /> :
        !isSearchRecipesSuccess ? <p>Search For Recipes</p> :
        <div className='results__body'>
          {pagination}
          <div className='results-grid' style={{ gridTemplateColumns: '1fr '.repeat(iconSizeBig ? COLUMNS_BIG : COLUMNS_SMALL) }}>
            {isSearchRecipesSuccess &&
            searchRecipesData.recipes.map(recipe => iconSizeBig
              ? <SearchRecipeIconLarge key={recipe.recipeID} recipe={recipe} selectRecipe={selectRecipe}/>
              : <SearchRecipeIcon key={recipe.recipeID} recipe={recipe} selectRecipe={selectRecipe}/>
            )}
          </div>
          {pagination}
        </div>}
      </section>
    </main>
  )
}

export default SearchRecipes