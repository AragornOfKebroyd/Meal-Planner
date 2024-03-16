import React from 'react'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectIngredients } from '../../../app/state/recipeDataSlice'
import Modal from '../../common/Modal'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons'

import './ExcludedIngredients.css'
import ConfirmationModal from '../modals/ConfirmationModal'

const ExcludedIngredients = ({ ingredientData, setIngredientData }) => {
  const [excludedIngredientName, setExcludedIngredientName] = useState('')
  const [excludedIngredientSearch, setExcludedIngredientSearch] = useState('')
  const [excludedIngs, setExcludedIngs] = useState([])
  const [ingOptions, setIngOptions] = useState([])
  const [editing, setEditing] = useState(false)

  const [modalContent, setModalContent] = useState()
  const [showModal, setShowModal] = useState(false)
  const allIngredients = useSelector(selectIngredients)
  
  const editExcludedItemClicked = (e, ingredient) => {
    setExcludedIngredientName(ingredient.name)
    setEditing(ingredient.name)
    setExcludedIngredientSearch('')
    setExcludedIngs(allIngredients.filter(ing => ingredient.ingredientIDs.includes(ing.ingredientID)))
    setIngOptions(allIngredients.filter(ing => excludedIngs.includes(ing) === false).slice(0,10))
    setModalContent('excluded-ingredient')
    setShowModal(true)
  }

  const deleteExcludedItemClicked = (e, ingredient) => {
    setEditing(ingredient.name)
    setModalContent('are-you-sure')
    setShowModal(true)
  }

  const deleteIngredient = (e) => {
    e.preventDefault()
    const excluded = ingredientData.excluded_ingredients.filter(ing => ing.name.toLowerCase() !== editing.toLowerCase())
    setIngredientData({...ingredientData, 'excluded_ingredients': excluded})
    setShowModal(false)
  }

  const deleteIngredientCanceled = (e) => {
    e.preventDefault()
    setShowModal(false)
  }

  const newExcludedItemClicked = async (e) => {
    setEditing('')
    setExcludedIngredientName('')
    setExcludedIngredientSearch('')
    setExcludedIngs([])
    setIngOptions(allIngredients.slice(0,10))
    setModalContent('excluded-ingredient')
    setShowModal(true)
  }

  const excludedIngredientNmaeUpdated = (e) => {
    setExcludedIngredientName(e.target.value)
    excludedSearchChanged(e)
  }

  const excludedSearchChanged = (e) => {
    setExcludedIngredientSearch(e.target.value)
    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1 && excludedIngs.includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const excludedIngChosen = (e, ingredient) => {
    e.preventDefault()
    setExcludedIngs([...excludedIngs, ingredient])

    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(excludedIngredientSearch.toLowerCase()) !== -1 && [...excludedIngs, ingredient].includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const excludedIngRemoved = (e, ingredient) => {
    e.preventDefault()
    const newIngs = excludedIngs.filter(ing => ing !== ingredient)
    setExcludedIngs(newIngs)
    const ingredients = allIngredients.filter(ing => ing.name.toLowerCase().indexOf(excludedIngredientSearch.toLowerCase()) !== -1 && newIngs.includes(ing) === false).slice(0,10)
    setIngOptions(ingredients)
  }

  const excludedIngredientsSaveClicked = (e) => {
    e.preventDefault()
    if (editing) {
      const targetIng = ingredientData.excluded_ingredients.find(ing => ing.name === editing)
      if (!targetIng) {
        setEditing(false)
        setShowModal(false)
        return console.error(`nothing found with the name ${editing}`)
      }
      const excluded = ingredientData.excluded_ingredients.map(ingredient => {
        if (ingredient.name === editing) {
          return {...ingredient, 'name': excludedIngredientName, 'ingredientIDs': excludedIngs.map(ing => ing.ingredientID), 'ingredientNames': excludedIngs.map(ing => ing.name).join(', ') }
        }
        return ingredient
      })
      setIngredientData({...ingredientData, 'excluded_ingredients': excluded})
    } else { // adding a new excluded ingredient
      const excluded = [...ingredientData.excluded_ingredients, {'name': excludedIngredientName, 'ingredientIDs': excludedIngs.map(ing => ing.ingredientID), 'ingredientNames':excludedIngs.map(ing => ing.name).join(', ') }]
      setIngredientData({...ingredientData, 'excluded_ingredients': excluded})
    }
    setEditing(false)
    setShowModal(false)
  }

  return (
    <section className='component__full-section'>
      {/* MODAL */}
      <Modal show={showModal} setShow={setShowModal}>
      {modalContent === 'excluded-ingredient' &&
        <form className='modal__form'>
          <h2 htmlFor='excluded_name'>Add Ingredients</h2>
          <input id='excluded_name' type='text' placeholder='Ingredient name' value={excludedIngredientName} onChange={excludedIngredientNmaeUpdated} className='component__input'></input>
          <h3>Accepted</h3>
          <div className='filter-display'>
            {excludedIngs.map(ingredient => <div className='selected_item'><button type="button" key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => excludedIngRemoved(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button></div>)}
          </div>
          <input type="text" placeholder="Search.." value={excludedIngredientSearch} onChange={excludedSearchChanged} className='component__input__small recipe-library__tag-input'/>
          <div className='filter-display'>
              {ingOptions.map(ingredient => <button type="button" key={ingredient.ingredientID} className='excluded-ingredient-option component__small-button' onClick={(e) => excludedIngChosen(e, ingredient)}>{ingredient.name}<p>({ingredient.count})</p></button>)}
          </div>
          <button type='submit' className='component__small-button component__button-colour-orange' onClick={excludedIngredientsSaveClicked} disabled={
            excludedIngredientName && excludedIngs.length && (ingredientData.excluded_ingredients.map(i => i.name).includes(excludedIngredientName) === false || editing) ? false : true}>Save</button>
          {ingredientData.excluded_ingredients.map(i => i.name).includes(excludedIngredientName) && !editing ? <p>You allready have an excluded ingredient called {excludedIngredientName}</p> : ''}
        </form>
        }
        {modalContent === 'are-you-sure' &&
          <ConfirmationModal message={`Delete Excluded Ingredient: ${editing}`} onConfirm={deleteIngredient} onCancel={deleteIngredientCanceled}/>
        }
      </Modal>
      <div className='settings__excluded-ingredients'>
        <table className='component__table settings__excluded-ingredients__table'>
          <thead className='component__table-thead'>
            <tr className='component__table-row component__table-heading'>
              <th className='component__table-item settings__excluded-ingredients__table-name'>Name</th>
              <th className='component__table-item settings__excluded-ingredients__table-ingredients'>Ingredient List</th>
            </tr>
          </thead>
          <tbody className='component__table-tbody'>
            {ingredientData.excluded_ingredients.map(ingredient => {
              return (
                <tr className='component__table-row' key={ingredient.name}>
                  <td className='component__table-item'>{ingredient.name}</td>
                  <td className='component__table-item'>
                    <div className='settings__exlcuded-ingredients__table-ingredients-list'>{ingredient.ingredientNames}</div>
                    <div className='excluded-ingredients__buttons'>
                      <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => editExcludedItemClicked(e, ingredient)} className='excluded-ingredients__button'/>
                      <FontAwesomeIcon icon={faTrashCan} onClick={(e) => deleteExcludedItemClicked(e, ingredient)} className='excluded-ingredients__button excluded-ingredients__button-delete'/>
                    </div>
                  </td>
                </tr>
              )
            })}
            <tr className='component__table-row'>
              <td className='component__table-item'><FontAwesomeIcon icon={faPlusCircle} onClick={newExcludedItemClicked}/></td>
              <td className='component__table-item'></td>
            </tr>
          </tbody>
        </table>
        <p className='subscript-note'>*This will remove some recipes that contain these ingredients but it can not remove all of them</p>
      </div>
    </section>
  )
}

export default ExcludedIngredients