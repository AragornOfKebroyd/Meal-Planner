import './ViewRecipe.css'

import { useCreateRecipeCopyMutation, useDeleteUserRecipeMutation, useGetRecipeQuery, useSetTagsMutation, useUpdateSavedRecipeMutation } from '../../../app/services/recipesApiSlice'

import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faEllipsisVertical, faStar } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef, useState } from 'react'
import useSaveRecipe from '../../../hooks/useSaveRecipe'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser, selectUserTags } from '../../../app/state/authSlice'
import _ from 'lodash'
import StarRating from '../../common/StarRating'
import Modal from '../../common/Modal'
import Spinner from '../../common/Spinner'
import ConfirmationModal from '../../common/modals/ConfirmationModal'
import { addSavedRecipe } from '../../../app/state/userDataSlice'
import { useReactToPrint } from 'react-to-print';
import StaticStarRating from '../../common/StarRatingStatic'

const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE
const NO_IMAGE = 'https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6-300x188.png'

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

// from https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
function useOutsideDisable(optionRef, menuRef, setShowOptionsMenu) {
  useEffect(() => {
    function handleClickOutside(event) {
      if ((optionRef.current && !optionRef.current.contains(event.target)) && (menuRef.current && !menuRef.current.contains(event.target)) && document.body.style.overflow == "scroll") {
        setShowOptionsMenu(false)
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    };
  }, [optionRef, menuRef])
}

const ViewRecipe = () => {
  const optionRef = useRef(null)
  const menuRef = useRef(null)
  const { recipeID } = useParams()
  const userID = useSelector(selectCurrentUser).userID

  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [saved, saveRecipeClicked, unsaveRecipeClicked] = useSaveRecipe(recipeID)
  const {data: getRecipeData, isLoading: isGetRecipeDataLoading, isSuccess: isGetRecipeDataSuccess, isError: isGetRecipeDataError, error: getRecipeDataError } = useGetRecipeQuery({recipeID, userID})

  useEffect(() => {
    if (isGetRecipeDataSuccess) {
      console.log(getRecipeData)
    }
  }, [isGetRecipeDataSuccess])

  useOutsideDisable(optionRef, menuRef, setShowOptionsMenu)

  // Printing (https://www.npmjs.com/package/react-to-print)

  const [isPrinting, setIsPrinting] = useState(false)
  const printRef = useRef()
  const promiseResolveRef = useRef(null)
  useEffect(() => {
    if (isPrinting && promiseResolveRef.current) {
      // Resolves the Promise, letting `react-to-print` know that the DOM updates are completed
      promiseResolveRef.current()
    }
  }, [isPrinting])
  
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        promiseResolveRef.current = resolve;
        setIsPrinting(true)
        setShowOptionsMenu(false)
      });
    },
    onAfterPrint: () => {
      // Reset the Promise resolve so we can print again
      promiseResolveRef.current = null;
      setIsPrinting(false)
    }
  })



  return (
    <main className='view-recipe-page'>
      <h2>{isGetRecipeDataSuccess ? getRecipeData.recipe.title : <Spinner />}</h2>
      {isGetRecipeDataSuccess && <>
      <section ref={printRef} className='component__container__wide view-recipe-main-section'>
        
        {/* Options Menu */}
        <FontAwesomeIcon ref={optionRef} icon={faEllipsisVertical} className='view-recipe__menu-icon' onClick={(e) => setShowOptionsMenu(!showOptionsMenu)}/>
        <OptionsMenu 
          showOptionsMenu={showOptionsMenu} 
          handlePrint={handlePrint} 
          menuRef={menuRef} 
          saved={saved} 
          saveRecipeClicked={saveRecipeClicked} 
          unsaveRecipeClicked={unsaveRecipeClicked}
          getRecipeData={getRecipeData} />

        {/* Main Content */}
        <div className='desc-and-image'>
          <div className='title-and-desc'>
            <div className='description-box'>
              <h4>Description</h4>
              <p className='description'>{getRecipeData.recipe.description || 'No descripiton'}</p>
              <div className='description-other-info'>
                {getRecipeData.recipe.ratings &&
              <><p className='bold-text'>Rating:</p> <StaticStarRating rating={getRecipeData.recipe.ratings}/></>}
                {getRecipeData?.saved?.rating &&
              <><p className='bold-text'>Your Rating:</p> <StaticStarRating rating={getRecipeData.recipeIsSaved ? getRecipeData?.saved?.rating : null}/></>}
                <p className='bold-text'>Author:</p> <p>{getRecipeData.recipe.author || '—'}</p>
              </div>
            </div>
          </div>
          <div className='recipe-image-wrapper'>
            <img src={useImage ? getRecipeData.recipe.image ? getRecipeData.recipe.image : DEFAULT_IMAGE : DEFAULT_IMAGE} alt='recipe outcome' className='recipe-image'onError={(e)=>{
                e.target.onError = null
                e.target.src = NO_IMAGE
              }}/>
          </div>
        </div>
        <h4>Nutrition</h4>
        <NutritionSection getRecipeData={getRecipeData}/>
        <h4>Other Information</h4>
        <div className='general-box'>
          <div className='information-grid'>
            <p className='bold-text'>Prep time:</p> <p>{getRecipeData.recipe.prep_time ? getRecipeData.recipe.prep_time + " minutes" : '—'}</p>
            <p className='bold-text'>Cook time:</p> <p>{getRecipeData.recipe.cook_time ? getRecipeData.recipe.cook_time + " minutes" : '—'}</p>
            <p className='bold-text'>Total time:</p> <p>{getRecipeData.recipe.total_time ? getRecipeData.recipe.total_time + " minutes" : '—'}</p>
            <p className='bold-text'>Serving Size:</p> <p>{getRecipeData.recipe.servingSize || '—'}</p>
            <p className='bold-text'>Yields:</p> <p>{getRecipeData.recipe.yields || getRecipeData.recipe.yield_number || '—'}</p>
          </div>
        </div>
        <h4>Ingredients</h4>
        <div className='general-box'>
          {getRecipeData.recipe.ingredient_groups.map(ingredientList => {
            return <div key={ingredientList.purpose}>
                <h5>{ingredientList.purpose === 'user_app' ? '' : ingredientList.purpose}</h5>
                <ul className='data-list'>
                  {ingredientList.ingredients.map((ingredient, n) => <li key={n}>{ingredient}</li>)}
                </ul>
              </div>
          })}
        </div>
        <h4>Instructions</h4>
        <div className='general-box'>
          <ol className='data-list'>
            {getRecipeData.recipe.instructions_list.map((instruction, n) => <li key={n}>{instruction}</li>)}
          </ol>
        </div>
        {/* <h4>Cuisines</h4>
        {getRecipeData.cuisines.map(cuisine => <p key={cuisine.cuisineID}>{cuisine.name}</p>)}
        <h4>Categories</h4>
        {getRecipeData.categories.map(category => <p key={category.categoryID}>{category.name}</p>)} */}
      </section>
      <h2>Rating and Tags</h2>
      <RatingsSection saved={saved} saveRecipeClicked={saveRecipeClicked} getRecipeData={getRecipeData} />
      </>}
    </main>
  )
}

const OptionsMenu = ({showOptionsMenu, getRecipeData, handlePrint, menuRef, saved, saveRecipeClicked, unsaveRecipeClicked}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userID = useSelector(selectCurrentUser).userID

  const addToMealPlanButtonClicked = (e) => {
    e.preventDefault()
    navigate('/app/meal-plans/select', {state: {recipe: getRecipeData.recipe, path: `/app/recipes/${getRecipeData.recipe.recipeID}`}})
  }

  // Create Copy
  const [createCopy, {isSuccess: createRecipeCopySuccess}] = useCreateRecipeCopyMutation()

  const createCopyButtonClicked = (e) => {
    e.preventDefault()
    createCopy({recipeID: getRecipeData.recipe.recipeID, userID})
  }

  useEffect(() => {
    if (createRecipeCopySuccess) {
      dispatch(addSavedRecipe(getRecipeData.recipe.recipeID))
      navigate('/app/recipes')
    }
  }, [createRecipeCopySuccess])

  const editRecipeClicked = (e) => {
    e.preventDefault()
    navigate(`/app/recipes/${getRecipeData.recipe.recipeID}/edit`, {state: {recipe: getRecipeData.recipe, path: `/app/recipes/${getRecipeData.recipe.recipeID}`}})
  }

  // Delete Recipe
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState()

  const [deleteRecipe, {isSuccess: deleteRecipeSuccess}] = useDeleteUserRecipeMutation()

  const deleteRecipeClicked = (e) => {
    e.preventDefault()
    setModalContent('confirm-delete')
    setShowModal(true)
  }

  const deleteRecipeConfirmed = (e) => {
    e.preventDefault()
    setShowModal(false)
    deleteRecipe({recipeID: getRecipeData.recipe.recipeID, userID})
  }

  useEffect(() => {
    if (deleteRecipeSuccess) {
      navigate('/app/recipes')
    }
  }, [deleteRecipeSuccess])


  // Return Data // 
  if (!showOptionsMenu) return ''
  
  // User Recipe

  let optionMenu

  if (getRecipeData.recipe.user_recipe === 1) {
    optionMenu = (
      <div ref={menuRef} className='view-recipe__menu'>
        <button className='view-recipe__menu-button' onClick={editRecipeClicked}>Edit</button>
        <button className='view-recipe__menu-button' onClick={addToMealPlanButtonClicked}>Add to Meal Plan</button>
        <a href={getRecipeData.recipe.url} className='view-recipe__menu-button link-button' target='_blank' rel='noreferrer noopener' >Open Link</a>
        <button className='view-recipe__menu-button' onClick={handlePrint}>Print</button>
        <button className='view-recipe__menu-button' onClick={deleteRecipeClicked}>Delete</button>
      </div>
    )
  } else {
    // Not User Recipe
    let saveButton
    if (saved) {
      saveButton = <button className='view-recipe__menu-button' onClick={unsaveRecipeClicked}>Unsave From Library</button>
    } else {
      saveButton = <button className='view-recipe__menu-button' onClick={saveRecipeClicked}>Save To Library</button>
    }
  
    optionMenu = (
      <div ref={menuRef} className='view-recipe__menu'>
        {saveButton}
        <button className='view-recipe__menu-button' onClick={addToMealPlanButtonClicked}>Add to Meal Plan</button>
        <button className='view-recipe__menu-button' onClick={createCopyButtonClicked}>Create A Copy</button>
        <a href={getRecipeData.recipe.url} className='view-recipe__menu-button link-button' target='_blank' rel='noreferrer noopener' >Open Link</a>
        <button className='view-recipe__menu-button' onClick={handlePrint}>Print</button>
      </div>
    )
  }

  return (
    <>
      {/* MODAL */}
      <Modal show={showModal} setShow={setShowModal}>
        {modalContent === 'confirm-delete' &&
          <ConfirmationModal message={'Are You Sure?'} onConfirm={deleteRecipeConfirmed} onCancel={(e) => setShowModal(false)}/>
        }
      </Modal>
      {optionMenu}
    </>
  )
}

const NutritionSection = ({getRecipeData}) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpandedClicked = (e) => {
    e.preventDefault()
    setExpanded(!expanded)
  }

  const generateText = (field, unit) => {
    const data = getRecipeData.recipe[field]
    if (!data) {
      return '—'
    }
    return `${data}${unit}`
  }

  if (expanded) {
    return (
      <div className='general-box'>
        <div className='expanded-nutrition'>
          <p className='bold-text'>Calories:</p> <p>{generateText('calories', 'kcal')}</p>
          <p className='bold-text'>Fat:</p> <p>{generateText('fatContent', 'g')}</p>
          <p className='bold-text'>Carbohydrate:</p> <p>{generateText('carbohydrateContent', 'g')}</p>
          <p className='bold-text'>Protein:</p> <p>{generateText('proteinContent', 'g')}</p>
          <p className='bold-text'>Sugar:</p> <p>{generateText('sugarContent', 'g')}</p>
          <p className='bold-text'>Sodium:</p> <p>{generateText('sodiumContent', 'mg')}</p>
          <p className='bold-text'>Fiber:</p> <p>{generateText('fiberContent', 'g')}</p>
          <p className='bold-text'>Cholesterol:</p> <p>{generateText('cholesterolContent', 'mg')}</p>
          <p className='bold-text'>Saturated Fat:</p> <p>{generateText('saturatedFatContent', 'g')}</p>
          <p className='bold-text'>Unsaturated Fat:</p> <p>{generateText('unsaturatedFatContent', 'g')}</p>
          <p className='bold-text'>Trans Fat:</p> <p>{generateText('transFatContent', 'g')}</p>
        </div>
        <button onClick={toggleExpandedClicked} className='expand-button'>Close<FontAwesomeIcon icon={faChevronUp}/></button>
      </div>
    )
  }

  return (
    <div className='general-box'>
      <div className='nutrition-grid'>
        <p className='bold-text'>Calories</p>
        <p className='bold-text'>Fat</p>
        <p className='bold-text'>Carbohydrates</p>
        <p className='bold-text'>Protein</p>
        <p className='bold-text'>Sugar</p>
        <p>{generateText('calories', 'kcal')}</p>
        <p>{generateText('fatContent', 'g')}</p>
        <p>{generateText('carbohydrateContent', 'g')}</p>
        <p>{generateText('proteinContent', 'g')}</p>
        <p>{generateText('sugarContent', 'g')}</p>
      </div>
      <button onClick={toggleExpandedClicked} className='expand-button'>Expand<FontAwesomeIcon icon={faChevronDown}/></button>
    </div>
  )
}


const RatingsSection = ({saved, saveRecipeClicked, getRecipeData}) => {
  const userID = useSelector(selectCurrentUser).userID

  // Tags
  const [tagSearch, setTagSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState(getRecipeData.tags)
  const allTags = useSelector(selectUserTags)
  const [tagOptions, setTagOptions] = useState([])

  useEffect(() => {
    updateTagOptions({newSelected: getRecipeData.tags})
  }, [])

  const updateTagOptions = (obj) => {
    const sel = obj.newSelected === undefined ? selectedTags : obj.newSelected
    const ser = obj.search === undefined ? tagSearch : obj.search
    setTagOptions(allTags.filter(tag => sel.map(sel => sel.name).includes(tag.name) === false && tag.name.indexOf(ser) !== -1).slice(0,10))
  }

  const tagSearchChanged = (e) => {
    setTagSearch(e.target.value)
    updateTagOptions({ search: e.target.value })
  }

  const tagSelected = (e, option) => {
    e.preventDefault()
    const newSelected = [...selectedTags, {...option}]
    setSelectedTags(newSelected)
    updateTagOptions({newSelected})
  }

  const tagDeselected = (e, option) => {
    e.preventDefault()
    const newSelected = selectedTags.filter(tag => tag !== option)
    setSelectedTags(newSelected)
    updateTagOptions({newSelected})
  }

  // Rating
  const [rating, setRating] = useState(getRecipeData.recipeIsSaved ? getRecipeData?.saved?.rating : null);

  // Saving

  const [setTags, {isSuccess: isSetTagsMutationSuccess}] = useSetTagsMutation()
  const [updateRating, {data: updateSavedRecipeData, isSuccess: isUpdateSavedRecipeSuccess}] = useUpdateSavedRecipeMutation()

  const saveButtonClicked = (e) => {
    e.preventDefault()
    setTags({recipeID: getRecipeData.recipe.recipeID, tagIDs: selectedTags.map(tag => tag.tagID), userID})
    updateRating({recipeID: getRecipeData.recipe.recipeID, userID, options: {rating}})
  }

  const discardButtonClicked = (e) => {
    console.log(_.isEqual(getRecipeData.tags, selectedTags), getRecipeData.tags, selectedTags)
    e.preventDefault()
    setSelectedTags(getRecipeData.tags)
    updateTagOptions({newSelected: getRecipeData.tags})
    setRating(getRecipeData?.saved?.rating)
  }

  if (!saved) {
    return <div>
      <p>You can only rate and add tags to saved recipes</p>
      <button className='view-recipe__menu-button' onClick={saveRecipeClicked}>Save To Library</button>
    </div>
  }

  const unsavedChangesCheck = () => {
    if (!_.isEqual(getRecipeData.tags, selectedTags)) return true
    if (rating) {
      return getRecipeData?.saved?.rating !== rating
    }
    return false
  }

  return (
    <section className='component__container__wide'>     
      <h3>Tags</h3>
      <div className='filter-display'>
        {selectedTags.map(option => 
        <div className='selected_item' key={option.name}>
          <button onClick={(e) => tagDeselected(e, option)} className='filter-display__option component__small-button'>{option.name}</button>
        </div>
        )}
      </div>
      <div className='filters'>
        <input value={tagSearch} onChange={tagSearchChanged} className='component__input' placeholder='Search tags...'/>
        <div className='filter-display'>
          {tagOptions.map(option => <button key={option.name} className='filter-display__option component__small-button' onClick={(e) => tagSelected(e, option)} >{option.name}</button>)}
        </div>
      </div>
      <h3>Rating</h3>
      <div>
        <StarRating rating={rating} setRating={setRating}/>
      </div>
      {unsavedChangesCheck() ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
      <div className='component__button-row'>
        <button onClick={saveButtonClicked} className='component__large-button component__button-colour-save' disabled={!unsavedChangesCheck()}>Save</button>
        <button onClick={discardButtonClicked} className='component__large-button component__button-colour-discard' disabled={!unsavedChangesCheck()}>Discard</button>
      </div>
    </section>
  )
}

export default ViewRecipe