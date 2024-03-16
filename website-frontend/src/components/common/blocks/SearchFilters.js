import React, { useEffect } from 'react'

import NutritionalValues from '../../common/blocks/NutritionalValues'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

import { useState } from 'react'
import { useSelector } from 'react-redux'

import './SearchFilters.css'
import { selectWebsites, selectIngredients, selectCuisines, selectCategories } from '../../../app/state/recipeDataSlice'

import { prepWebsiteOptionsSearch, prepIngredientOptionsSearch, prepCuisineOptionsSearch, prepCategoryOptionsSearch, prepNutrientsOptionsSearch, prepStatsOptionsSearch } from '../../../functionality/prepSearchOptions'


const NUM_OF_OPTIONS = 12

const SearchFilters = ({ searchOptions, setSearchOptions, className }) => {
  const [currentData, setCurrentData] = useState(useSelector((state) => state.auth.userData))

  // Dropdowns
  const [websiteDropdown, setWebsiteDropdown] = useState(true)
  const toggleWebsiteDropdown = (e) => setWebsiteDropdown(!websiteDropdown)
  
  const [statsDropdown, setStatsDropdown] = useState(true)
  const toggleStatsDropdown = (e) => setStatsDropdown(!statsDropdown)

  const [ingredientDropdown, setIngredientDropdown] = useState(true)
  const toggleIngredientDropdown = (e) => setIngredientDropdown(!ingredientDropdown)

  const [cuisineDropdown, setCuisineDropdown] = useState(true)
  const toggleCuisineDropdown = (e) => setCuisineDropdown(!cuisineDropdown)

  const [categoryDropdown, setCategoryDropdown] = useState(true)
  const toggleCategoryDropdown = (e) => setCategoryDropdown(!categoryDropdown)

  const [nutritionDropdown, setNutritionDropdown] = useState(true)
  const toggleNutritionDropdown = (e) => setNutritionDropdown(!nutritionDropdown)

  // Websites
  const [websiteSearch, setWebsiteSearch] = useState('')
  const [selectedWebsites, setSelectedWebsites] = useState([])
  const allWebsites = useSelector(selectWebsites)
  const [websiteOptions, setWebsiteOptions] = useState([])

  const updateWebsiteOptions = (obj) => {
    const sel = obj.newSelected === undefined ? selectedWebsites : obj.newSelected
    const ser = obj.search === undefined ? websiteSearch.toLowerCase() : obj.search.toLowerCase()
    setWebsiteOptions(allWebsites.filter(website => sel.map(sel => sel.name.toLowerCase()).includes(website.name.toLowerCase()) === false && website.name.indexOf(ser) !== -1).slice(0,NUM_OF_OPTIONS))
  }

  useEffect(() => {
    prepWebsiteOptionsSearch(selectedWebsites, searchOptions, setSearchOptions)
  }, [selectedWebsites])

  useEffect(() => {
    updateWebsiteOptions({})
  }, [])

  const websiteSearchChanged = (e) => {
    setWebsiteSearch(e.target.value)
    updateWebsiteOptions({ search: e.target.value })
  }

  const websiteSelected = (e, option) => {
    e.preventDefault()
    const newSelected = [...selectedWebsites, {...option, 'include': true}]
    setSelectedWebsites(newSelected)
    updateWebsiteOptions({newSelected})
  }

  const websiteDeselected = (e, option) => {
    e.preventDefault()
    const newSelected = selectedWebsites.filter(website => website !== option)
    setSelectedWebsites(newSelected)
    updateWebsiteOptions({newSelected})
  }

  const selectedWebsiteToggled = (e, option) => {
    setSelectedWebsites(selectedWebsites.map(website => website === option ? {...option, 'include': !option.include} : website ))
  }

  // Stats
  const updateStatsOptions = (stat) => {
    setSearchOptions({...searchOptions, recipeOptions: {...searchOptions.recipeOptions, [stat.field]: [stat.equality, stat.value]}})
  }

  const [preptimeslider, setPrepTimeSlider] = useState(0)
  const [prepEqualityType, setPrepEqualityType] = useState('>=')
  const updatePrepTime = () => updateStatsOptions({field: 'prep_time', equality: prepEqualityType, value: preptimeslider})
  
  const [cooktimeslider, setCookTimeSlider] = useState(0)
  const [cookEqualityType, setCookEqualityType] = useState('>=')
  const updateCookTime = () => updateStatsOptions({field: 'cook_time', equality: cookEqualityType, value: cooktimeslider})

  const [totaltimeslider, setTotalTimeSlider] = useState(0)
  const [totalEqualityType, setTotalEqualityType] = useState('>=')
  const updateTotalTime = () => updateStatsOptions({field: 'total_time', equality: totalEqualityType, value: totaltimeslider})

  const [yieldsslider, setYieldsSlider] = useState(0)
  const [yieldsEqualityType, setYieldsEqualityType] = useState('>=')
  const updateYields = () => updateStatsOptions({field: 'yield_number', equality: yieldsEqualityType, value: yieldsslider})

  const [ratingslider, setRatingSlider] = useState(0)
  const [ratingEqualityType, setRatingEqualityType] = useState('>=')
  const updateRating = () => updateStatsOptions({field: 'ratings', equality: ratingEqualityType, value: ratingslider})


  // Ingredients
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const allIngredients = useSelector(selectIngredients)
  
  // Put preset from user settings in
  useEffect(() => {
    const excludedIDs = [].concat(...currentData.excluded_ingredients.map(ing => {
      return ing.ingredientIDs
    }))
    const excludedIngs = excludedIDs.map(id => allIngredients.find(ing => ing.ingredientID === id))
    const excludedFormatted = excludedIngs.map(ingredient => {return {...ingredient, 'include': false, 'disabled': true}})
    setSelectedIngredients([...excludedFormatted])
  }, [])

  const [ingredientOptions, setIngredientOptions] = useState([])

  const updateIngredientOptions = (obj) => {
    const sel = obj.newSelected === undefined ? selectedIngredients : obj.newSelected
    const ser = obj.search === undefined ? ingredientSearch.toLowerCase() : obj.search.toLowerCase()
    setIngredientOptions(allIngredients.filter(ingredient => sel.map(sel => sel.name.toLowerCase()).includes(ingredient.name.toLowerCase()) === false && ingredient.name.indexOf(ser) !== -1).slice(0,NUM_OF_OPTIONS))
  }

  useEffect(() => {
    prepIngredientOptionsSearch(selectedIngredients, searchOptions, setSearchOptions)
  }, [selectedIngredients])

  useEffect(() => {
    updateIngredientOptions({})
  }, [])

  const ingredientSearchChanged = (e) => {
    setIngredientSearch(e.target.value)
    updateIngredientOptions({ search: e.target.value })
  }

  const ingredientSelected = (e, option) => {
    e.preventDefault()
    const newSelected = [...selectedIngredients, {...option, 'include': true}]
    setSelectedIngredients(newSelected)
    updateIngredientOptions({newSelected})
  }

  const ingredientDeselected = (e, option) => {
    e.preventDefault()
    const newSelected = selectedIngredients.filter(ingredient => ingredient !== option)
    setSelectedIngredients(newSelected)
    updateIngredientOptions({newSelected})
  }

  const selectedIngredientToggled = (e, option) => {
    setSelectedIngredients(selectedIngredients.map(ingredient => ingredient === option ? {...option, 'include': !option.include} : ingredient ))
  }

  // Cuisines
  const [cuisineSearch, setCuisineSearch] = useState('')
  const [selectedCuisines, setSelectedCuisines] = useState([])
  const allCuisines = useSelector(selectCuisines)
  const [cuisineOptions, setCuisineOptions] = useState([])

  const updateCuisineOptions = (obj) => {
    const sel = obj.newSelected === undefined ? selectedCuisines : obj.newSelected
    const ser = obj.search === undefined ? cuisineSearch.toLowerCase() : obj.search.toLowerCase()
    setCuisineOptions(allCuisines.filter(cuisine => sel.map(sel => sel.name.toLowerCase()).includes(cuisine.name.toLowerCase()) === false && cuisine.name.indexOf(ser) !== -1).slice(0,NUM_OF_OPTIONS))
  }

  useEffect(() => {
    prepCuisineOptionsSearch(selectedCuisines, searchOptions, setSearchOptions)
  }, [selectedCuisines])

  useEffect(() => {
    updateCuisineOptions({})
  }, [])

  const cuisineSearchChanged = (e) => {
    setCuisineSearch(e.target.value)
    updateCuisineOptions({ search: e.target.value })
  }

  const cuisineSelected = (e, option) => {
    e.preventDefault()
    const newSelected = [...selectedCuisines, {...option, 'include': true}]
    setSelectedCuisines(newSelected)
    updateCuisineOptions({newSelected})
  }

  const cuisineDeselected = (e, option) => {
    e.preventDefault()
    const newSelected = selectedCuisines.filter(cuisine => cuisine !== option)
    setSelectedCuisines(newSelected)
    updateCuisineOptions({newSelected})
  }

  const selectedCuisineToggled = (e, option) => {
    setSelectedCuisines(selectedCuisines.map(cuisine => cuisine === option ? {...option, 'include': !option.include} : cuisine ))
  }


  // Categories
  const [categorySearch, setCategorySearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const allCategories = useSelector(selectCategories)
  const [categoryOptions, setCategoryOptions] = useState([])

  const updateCategoryOptions = (obj) => {
    const sel = obj.newSelected === undefined ? selectedCategories : obj.newSelected
    const ser = obj.search === undefined ? categorySearch.toLowerCase() : obj.search.toLowerCase()
    setCategoryOptions(allCategories.filter(category => sel.map(sel => sel.name.toLowerCase()).includes(category.name.toLowerCase()) === false && category.name.indexOf(ser) !== -1).slice(0,NUM_OF_OPTIONS))
  }

  useEffect(() => {
    prepCategoryOptionsSearch(selectedCategories, searchOptions, setSearchOptions)
  }, [selectedCategories])

  useEffect(() => {
    updateCategoryOptions({})
  }, [])

  const categorySearchChanged = (e) => {
    setCategorySearch(e.target.value)
    updateCategoryOptions({ search: e.target.value })
  }

  const categorySelected = (e, option) => {
    e.preventDefault()
    const newSelected = [...selectedCategories, {...option, 'include': true}]
    setSelectedCategories(newSelected)
    updateCategoryOptions({newSelected})
  }

  const categoryDeselected = (e, option) => {
    e.preventDefault()
    const newSelected = selectedCategories.filter(category => category !== option)
    setSelectedCategories(newSelected)
    updateCategoryOptions({newSelected})
  }

  const selectedCategoryToggled = (e, option) => {
    setSelectedCategories(selectedCategories.map(category => category === option ? {...option, 'include': !option.include} : category ))
  }


  // Nutrition in nutrition sub-component
  useEffect(() => {
    prepNutrientsOptionsSearch(currentData, searchOptions, setSearchOptions)
  }, [currentData]) // current data will only change in the nutrition component


  return (
    <section className={`component__container__wide ${className}`}>
      {/* Websites */}
      <h4>Websites<FontAwesomeIcon icon={faChevronDown} onClick={toggleWebsiteDropdown} className={`options-header-arrow ${!websiteDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {websiteDropdown && <>
      <div className='filter-display'>
        {selectedWebsites.map(option => 
        <div className={`selected_item selected_item${option.include ? '-include' : '-exclude'}`} key={option.name}>
          <label className="switch">
            <input type="checkbox" onClick={(e) => selectedWebsiteToggled(e, option)} defaultChecked={option.include} className='slider-backgroud'/>
            <span className="slider round"></span>
          </label>
          <button onClick={(e) => websiteDeselected(e, option)} className='filter-display__option component__small-button'>{option.name}</button>
        </div>
        )}
      </div>
      <div className='filters'>
        <input value={websiteSearch} onChange={websiteSearchChanged} className='component__input' placeholder='Filter source websites...'/>
        <div className='filter-display'>
          {websiteOptions.map(option => <button key={option.name} className='filter-display__option component__small-button' onClick={(e) => websiteSelected(e, option)} >{option.name}</button>)}
        </div>
      </div></>}

      {/* Stats */}
      <h4 className='filters__section-title'>Stats<FontAwesomeIcon icon={faChevronDown} onClick={toggleStatsDropdown} className={`options-header-arrow ${!statsDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {statsDropdown &&
      <div className='filters'>
        <div className='stats__row'>
          <label htmlFor='preptime'>Prep Time</label> 
          <select name='equalitycheck' className='equalitycheck' value={prepEqualityType} onChange={(e) => setPrepEqualityType(e.target.value)} onBlur={updatePrepTime}>
            <option value=">=">more than</option>
            <option value="<=">less than</option>
          </select>
          <input type='number' min='0' max='100' step='1' value={preptimeslider} onChange={(e) => setPrepTimeSlider(e.target.value)} onBlur={updatePrepTime} className='stats__row__number'/>
          <input type='range' min='0' max='100' step='1' value={preptimeslider} onChange={(e) => setPrepTimeSlider(e.target.value)} onBlur={updatePrepTime} className='stats__row__range'/>
          <p>minutes</p>
        </div>

        <div className='stats__row'>
          <label htmlFor='cooktime'>Cook Time</label> 
          <select name='equalitycheck' className='equalitycheck' value={cookEqualityType} onChange={(e) => setCookEqualityType(e.target.value)} onBlur={updateCookTime}>
            <option value=">=">more than</option>
            <option value="<=">less than</option>
          </select>
          <input type='number' min='0' max='100' step='1' value={cooktimeslider} onChange={(e) => setCookTimeSlider(e.target.value)} onBlur={updateCookTime} className='stats__row__number'/>
          <input type='range' min='0' max='100' step='1' value={cooktimeslider} onChange={(e) => setCookTimeSlider(e.target.value)} onBlur={updateCookTime} className='stats__row__range'/>
          <p>minutes</p>
        </div>

        <div className='stats__row'>
          <label htmlFor='totaltime'>Total Time</label> 
          <select name='equalitycheck' className='equalitycheck' value={totalEqualityType} onChange={(e) => setTotalEqualityType(e.target.value)} onBlur={updateTotalTime}>
            <option value=">=">more than</option>
            <option value="<=">less than</option>
          </select>
          <input type='number' min='0' max='300' step='1' value={totaltimeslider} onChange={(e) => setTotalTimeSlider(e.target.value)} onBlur={updateTotalTime} className='stats__row__number'/>
          <input type='range' min='0' max='300' step='1' value={totaltimeslider} onChange={(e) => setTotalTimeSlider(e.target.value)} onBlur={updateTotalTime} className='stats__row__range'/>
          <p>minutes</p>
        </div>

        <div className='stats__row'>
          <label htmlFor='yields'>Yields</label> 
          <select name='equalitycheck' className='equalitycheck' value={yieldsEqualityType} onChange={(e) => setYieldsEqualityType(e.target.value)} onBlur={updateYields}>
            <option value=">=">more than</option>
            <option value="<=">less than</option>
          </select>
          <input type='number' min='0' max='10' step='1' value={yieldsslider} onChange={(e) => setYieldsSlider(e.target.value)} onBlur={updateYields} className='stats__row__number'/>
          <input type='range' min='0' max='10' step='1' value={yieldsslider} onChange={(e) => setYieldsSlider(e.target.value)} onBlur={updateYields} className='stats__row__range'/>
          <p>yields</p>
        </div>

        <div className='stats__row'>
          <label htmlFor='rating'>Rating</label> 
          <select name='equalitycheck' className='equalitycheck' value={ratingEqualityType} onChange={(e) => setRatingEqualityType(e.target.value)} onBlur={updateRating}>
            <option value=">=">more than</option>
            <option value="<=">less than</option>
          </select>
          <input type='number' min='0' max='5' value={ratingslider} onChange={(e) => setRatingSlider(e.target.value)} onBlur={updateRating} className='stats__row__number'/>
          <input type='range' min='0' max='5' value={ratingslider} onChange={(e) => setRatingSlider(e.target.value)} onBlur={updateRating} className='stats__row__range'/>
          <p>stars</p>
        </div>
      </div>}
      
      {/* Ingredients */}
      <h4 className='filters__section-title'>Ingredients<FontAwesomeIcon icon={faChevronDown} onClick={toggleIngredientDropdown} className={`options-header-arrow ${!ingredientDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {ingredientDropdown && <>
      <div className='filter-display'>
        {selectedIngredients.map(option => 
        <div className={`selected_item selected_item${option.include ? '-include' : '-exclude'}`} key={option.ingredientID}>
          <label className="switch">
            <input type="checkbox" onClick={(e) => selectedIngredientToggled(e, option)} defaultChecked={option.include} disabled={option.disabled} className='slider-backgroud'/>
            <span className="slider round"></span>
          </label>
          <button onClick={(e) => ingredientDeselected(e, option)} className='filter-display__option component__small-button'>{option.name}</button>
        </div>
      )}
      </div>
      <div className='filters'>
        <input value={ingredientSearch} onChange={ingredientSearchChanged} className='component__input' placeholder='Filter ingredients...'/>
        <div className='filter-display'>
          {ingredientOptions.map(option => <button key={option.ingredientID} className='filter-display__option component__small-button' onClick={(e) => ingredientSelected(e, option)} >{option.name}</button>)}
        </div>
      </div></>}

      {/* Cuisines */}
      <h4 className='filters__section-title'>Cuisines<FontAwesomeIcon icon={faChevronDown} onClick={toggleCuisineDropdown} className={`options-header-arrow ${!cuisineDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {cuisineDropdown && <>
      <div className='filter-display'>
        {selectedCuisines.map(option => 
        <div className={`selected_item selected_item${option.include ? '-include' : '-exclude'}`} key={option.cuisineID}>
          <label className="switch">
            <input type="checkbox" onClick={(e) => selectedCuisineToggled(e, option)} defaultChecked={option.include} className='slider-backgroud'/>
            <span className="slider round"></span>
          </label>
          <button onClick={(e) => cuisineDeselected(e, option)} className='filter-display__option component__small-button'>{option.name}</button>
        </div>
      )}
      </div>
      <div className='filters'>
        <input value={cuisineSearch} onChange={cuisineSearchChanged} className='component__input' placeholder='Filter cuisines...'/>
        <div className='filter-display'>
          {cuisineOptions.map(option => <button key={option.cuisineID} className='filter-display__option component__small-button' onClick={(e) => cuisineSelected(e, option)} >{option.name}</button>)}
        </div>
      </div></>}

      {/* Categories */}
      <h4 className='filters__section-title'>Categories<FontAwesomeIcon icon={faChevronDown} onClick={toggleCategoryDropdown} className={`options-header-arrow ${!categoryDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {categoryDropdown && <>
      <div className='filter-display'>
        {selectedCategories.map(option => 
        <div className={`selected_item selected_item${option.include ? '-include' : '-exclude'}`} key={option.categoryID}>
          <label className="switch">
            <input type="checkbox" onClick={(e) => selectedCategoryToggled(e, option)} defaultChecked={option.include} className='slider-backgroud'/>
            <span className="slider round"></span>
          </label>
          <button onClick={(e) => categoryDeselected(e, option)} className='filter-display__option component__small-button'>{option.name}</button>
        </div>
      )}
      </div>
      <div className='filters'>
        <input value={categorySearch} onChange={categorySearchChanged} className='component__input' placeholder='Filter categories...'/>
        <div className='filter-display'>
          {categoryOptions.map(option => <button key={option.categoryID} className='filter-display__option component__small-button' onClick={(e) => categorySelected(e, option)} >{option.name}</button>)}
        </div>
      </div></>}

      {/* Nutrition */}
      <h4 className='filters__section-title'>Nutrition<FontAwesomeIcon icon={faChevronDown} onClick={toggleNutritionDropdown} className={`options-header-arrow ${!nutritionDropdown ? 'options-header-arrow-up' : ''}`}/></h4>
      {nutritionDropdown && 
      <NutritionalValues ingredientData={currentData} setIngredientData={setCurrentData} />}
    </section>
  )
}

export default SearchFilters