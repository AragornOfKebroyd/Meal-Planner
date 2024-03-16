import './SavedRecipeLibrary.css'

import RecipeIcon from '../../common/recipe icons/RecipeIcon'

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons'

import { updateTagList, removeFromTagList } from '../../../app/state/authSlice'
import { selectCurrentUser, selectUserTags } from '../../../app/state/authSlice'
import { useGetSavedAndUserRecipesQuery } from '../../../app/services/recipesApiSlice'
import { useAddTagMutation, useRemoveTagMutation } from '../../../app/services/usersApiSlice'
import UserRecipeIcon from '../../common/recipe icons/UserRecipeIcon'
import Modal from '../../common/Modal'
import ConfirmationModal from '../../common/modals/ConfirmationModal'
import SavedRecipeIcon from '../../common/recipe icons/SavedRecipeIcon'

const SavedRecipeLibrary = () => {
  const dispatch = useDispatch()

  const userID = useSelector(selectCurrentUser).userID
  const { data: getUserSavedRecipeData, isSuccess: isGetUserSavedRecipeSuccess } = useGetSavedAndUserRecipesQuery({userID, IDsOnly: false})
  const tags = useSelector(selectUserTags)
  const [searchInput, setSearchInput] = useState('')
  
  const searchInputChanged = (e) => {
    setSearchInput(e.target.value)
  }

  // Tags

  const [addTag, {data: addTagData, isSuccess: isAddTagSuccess}] = useAddTagMutation()
  const [removeTag, {data: removeTagData, isSuccess: isRemoveTagSuccess}] = useRemoveTagMutation()
  const [selectedTags, setSelectedTags] = useState([])
  const [tagData, setTagData] = useState(null)
  const [tagName, setTagName] = useState('')
  const [addTagDisabled, setAddTagDisabled] = useState(true)

  useEffect(() => {
    if (isGetUserSavedRecipeSuccess) {
      const savedData = getUserSavedRecipeData.map(recipe => ({[recipe.recipeID]: recipe.tagIDs ? recipe.tagIDs.split(',').map(Number) : []}))
      const data = Object.assign({}, ...savedData)
      setTagData(data)
    }
  }, [isGetUserSavedRecipeSuccess])

  const tagUseChanged = (e, tag) => {
    if (e.target.checked) {
      setSelectedTags([...selectedTags, tag.tagID])
    } else {
      setSelectedTags(selectedTags.filter(tagID => tagID !== tag.tagID))
    }
  }

  const tagNameChanged = (e) => {
    setTagName(e.target.value)
    if (e.target.value === '' || tags.map(tag => tag.name).includes(e.target.value)){
      setAddTagDisabled(true)
    }  else {
      setAddTagDisabled(false)
    }
  }

  const addTagClicked = (e) => {
    e.preventDefault()
    addTag({userID, tagName})
    setTagName('')
    setAddTagDisabled(true)
  }

  useEffect(() => {
    if (isAddTagSuccess) {
      dispatch(updateTagList(addTagData))
    }
  }, [isAddTagSuccess])


  const filterRecipe = (recipe) => {
    const matchesTags = selectedTags.length
      ? selectedTags.every((tagID) => tagData[recipe.recipeID].includes(tagID))
      : true
    const matchesSearch = recipe.title.toLowerCase().includes(searchInput.toLowerCase())
    return matchesTags && matchesSearch
  }
  
  // Delete tags
  const [modalContent, setModalContent] = useState()
  const [showModal, setShowModal] = useState(false)
  const [deleteTagID, setDeleteTagID] = useState()
  
  const tagDeleteClicked = (tagID) => {
    setDeleteTagID(tagID)
    setModalContent('delete-tag-confirmation')
    setShowModal(true)
  }

  const confirmDeleteTagModalClicked = () => {
    if (deleteTagID) {
      removeTag({userID, tagID: deleteTagID})
      setSelectedTags(selectedTags.filter(tagID => tagID !== deleteTagID))
    } else {
      console.warn('shouldnt occur, no deleteTagID set', deleteTagID)
    }
    setDeleteTagID(null)
    setShowModal(false)
  }

  const cancelDeleteTagModalClicked = () => {
    setDeleteTagID(null)
    setShowModal(false)
  }

  useEffect(() => {
    if (isRemoveTagSuccess) {
      dispatch(removeFromTagList(removeTagData.removed))
    }
  }, [isRemoveTagSuccess])



  return (
    <main className='saved-recipe-library-page'>
      {/* Modal */}
      <Modal show={showModal} setShow={setShowModal}>
        {modalContent === 'delete-tag-confirmation' && 
          <ConfirmationModal message='Are You Sure?' onConfirm={confirmDeleteTagModalClicked} onCancel={cancelDeleteTagModalClicked}/>
        }
      </Modal>
      <h2>Saved Recipe Library</h2>
      <input type='search' className='component__search' placeholder='Search Your Saved Recipes' value={searchInput} onChange={searchInputChanged}/>
      <h3>Tags</h3>
      <section className='component__container__wide'>
        <p>Filter by tags:</p>
        {tags.map(tag => <div key={tag.tagID} className='recipe-library__tag-filter'>
          <input type='checkbox' className='component__checkbox' onChange={(e) => tagUseChanged(e, tag)}/>
          <p className='recipe-library__tag-filter__go-to-right'>{tag.name}</p>
          <FontAwesomeIcon icon={faTrash} onClick={(e) => tagDeleteClicked(tag.tagID)}/>
        </div>)}
        <input placeholder='Create a tag...' value={tagName} onChange={tagNameChanged} className='component__input__small recipe-library__tag-input'/>
        <button className='component__small-button component__button-colour-orange' disabled={addTagDisabled} onClick={addTagClicked}>Add Tag</button>
      </section>

      <h3>My Recipes</h3>
      <section className='component__container__wide'>
        {isGetUserSavedRecipeSuccess && tagData &&
          <MyRecipes getUserSavedRecipeData={getUserSavedRecipeData} filterRecipe={filterRecipe}/>
        }
      </section>

      <h3>Saved Recipes</h3>
      <section className='component__container__wide'>
        {isGetUserSavedRecipeSuccess && tagData &&
          <SavedRecipes getUserSavedRecipeData={getUserSavedRecipeData} filterRecipe={filterRecipe}/>
        }
      </section>
    </main>
  )
}

const MyRecipes = ({getUserSavedRecipeData, filterRecipe}) => {
  const filteredRecipes = getUserSavedRecipeData.filter(recipe => recipe.user_recipe === 1 && filterRecipe(recipe))

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
          filteredRecipes.slice(0, showAmount).map(recipe => <UserRecipeIcon key={recipe.recipeID} recipe={recipe} />)
        }
        <Link to={`/app/recipes/create`}><button className='add-new-recipe-button'>+</button></Link>
      </div>
      {showLoadMore &&
        <button className='component__large-button component__button-colour-orange' onClick={loadMoreClicked}>Load More <FontAwesomeIcon icon={faChevronDown}/></button>
      }
    </>
  )
}

const SavedRecipes = ({getUserSavedRecipeData, filterRecipe}) => {
  const filteredRecipes = getUserSavedRecipeData.filter(recipe => recipe.user_recipe === 0 && filterRecipe(recipe))

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
          filteredRecipes.slice(0, showAmount).map(recipe => <SavedRecipeIcon key={recipe.recipeID} recipe={recipe} />)
        }
      </div>
      {showLoadMore &&
        <button className='component__large-button component__button-colour-orange' onClick={loadMoreClicked}>Load More <FontAwesomeIcon icon={faChevronDown}/></button>
      }
    </>
  )
}

export default SavedRecipeLibrary