import { useState } from 'react'
import './CreateEditRecipeCommon.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowDown, faArrowUp, faPenToSquare, faPlusCircle, faStar, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import Modal from '../../common/Modal'
import ConfirmationModal from '../../common/modals/ConfirmationModal'
import _ from 'lodash'

const CreateEditRecipeCommon = ({currentData, setCurrentData, name, onSaveClicked, originalData}) => {

  const [prepTime, setPrepTime] = useState(currentData.recipe.prep_time)
  const updatePrepTime = () => {
    const total = Number(prepTime)+Number(cookTime)
    setCurrentData({...currentData, recipe: {...currentData.recipe, prep_time: prepTime, total_time: total}})
    setTotalTime(total)
  }
  const [cookTime, setCookTime] = useState(currentData.recipe.cook_time)
  const updateCookTime = () => {
    const total = Number(prepTime)+Number(cookTime)
    setCurrentData({...currentData, recipe: {...currentData.recipe, cook_time: cookTime, total_time: Number(prepTime)+Number(cookTime)}})
    setTotalTime(total)
  }
  const [totalTime, setTotalTime] = useState(currentData.recipe.total_time)
  const updateTotalTime = () => setCurrentData({...currentData, recipe: {...currentData.recipe, total_time: totalTime}})


  const [yields, setYields] = useState(currentData.recipe.yield_number)
  const updateYields = () => setCurrentData({...currentData, recipe: {...currentData.recipe, yield_number: Number(yields)}})

  const disabledCheck = () => {
    if (currentData.recipe.title === '') return true
    if (currentData.recipe.prep_time < 0
      || currentData.recipe.cook_time < 0
      || currentData.recipe.total_time < 0
      || currentData.recipe.yield_number < 0) return true
    if (_.isEqual(currentData, originalData)) return true
    return false
  }

  // Modal
  const [modalContent, setModalContent] = useState()
  const [showModal, setShowModal] = useState(false)

  // Ingredients
  const newIngredientClicked = () => {
    setModalContent('ingredient-modal')
    setIngredientName('')
    setShowModal(true)
  }

  const [ingredientName, setIngredientName] = useState('')
  
  const addIngredientModal = (e) => {
    e.preventDefault()
    const oldIngredientGroups = currentData.recipe.ingredient_groups
    const current = oldIngredientGroups.find(group => group.purpose ==='user_app')
    let ingGroups
    if (current?.ingredients) {
      ingGroups = oldIngredientGroups.filter(group => group.purpose !=='user_app')
        .concat({ingredients: [...current.ingredients, ingredientName], purpose: current.purpose})
    } else {
      ingGroups = [...oldIngredientGroups, {ingredients: [ingredientName], purpose: 'user_app'}]
    }
    setCurrentData({...currentData, recipe: {...currentData.recipe, ingredient_groups: ingGroups}})
    setIngredientName('')
    setShowModal(false)
  }

  const cancelIngredientModal = (e) => {
    e.preventDefault()
    setIngredientName('')
    setShowModal(false)
  }

  const [editingIngredient, setEditingIngredient] = useState()

  const editIngredientClicked = (e, ingredient, n) => {
    console.log(ingredient)
    setEditingIngredient(ingredient)
    setIngredientName(ingredient.name)
    setModalContent('edit-ingredient-modal')
    setShowModal(true)
  }

  const editIngredientConfirmed = (e) => {
    e.preventDefault()
    console.log(editingIngredient, ingredientName)
    const newIngredientsGroups = currentData.recipe.ingredient_groups.map(group => {
      if (group.purpose !== editingIngredient.group) {
        return group
      }
      const newGroup = {...group, ingredients: group.ingredients.map((ingredient, n) => {
        if (n !== editingIngredient.index) {
          return ingredient
        }
        return ingredientName
      })}
      return newGroup
    })
    setCurrentData({...currentData, recipe: {...currentData.recipe, ingredient_groups: newIngredientsGroups}})
    setShowModal(false)
    setEditingIngredient(null)
  }

  const editIngredientCancelled = (e) => {
    e.preventDefault()
    setShowModal(false)
    setEditingIngredient(null)
  }

  const [deleteIngredient, setDeleteIngredient] = useState()

  const deleteIngredientClicked = (e, ingredient, n) => {
    setDeleteIngredient(ingredient)
    setModalContent('confirm-delete-ingredient-moal')
    setShowModal(true)
  }

  const deleteIngredientConfirmed = (e) => {
    e.preventDefault()
    console.log(deleteIngredient)
    const filteredIngredientGroups = currentData.recipe.ingredient_groups.map(group => {
      if (group.purpose !== deleteIngredient.group) {
        return group
      }
      const newGroup = {...group, ingredients: group.ingredients.filter((ingredient, n) => n !== deleteIngredient.index)}
      return newGroup
    })
    setCurrentData({...currentData, recipe: {...currentData.recipe, ingredient_groups: filteredIngredientGroups}})

    setShowModal(false)
  }

  const deleteIngredientCancelled = (e) => {
    e.preventDefault()
    setShowModal(false)
  }

  // Instructions
  const newInstructionClicked = () => {
    setModalContent('instruction-modal')
    setInstructionName('')
    setShowModal(true)
  }

  // Move instructions
  
  const moveInstructionUp = (e, instruction, n) => {
    console.log(instruction, n)
    var withoutCurrent = currentData.recipe.instructions_list.filter((_,i) => i !== n)
    var start = withoutCurrent.slice(0,n-1)
    var after = withoutCurrent.slice(n-1)
    const newInstructionsList = [].concat(...start, instruction, ...after)
    setCurrentData({...currentData, recipe: {...currentData.recipe, instructions_list: newInstructionsList}})
  }
  const moveInstructionDown = (e, instruction, n) => {
    console.log(instruction, n)
    var withoutCurrent = currentData.recipe.instructions_list.filter((_,i) => i !== n)
    var start = withoutCurrent.slice(0,n+1)
    var after = withoutCurrent.slice(n+1)
    const newInstructionsList = [].concat(...start, instruction, ...after)
    setCurrentData({...currentData, recipe: {...currentData.recipe, instructions_list: newInstructionsList}})
  }

  const [instructionName, setInstructionName] = useState('')
  
  const addInstructionModal = (e) => {
    e.preventDefault()
    setCurrentData({...currentData, recipe: {...currentData.recipe, instructions_list: [...currentData.recipe.instructions_list, instructionName]}})
    setInstructionName('')
    setShowModal(false)
  }

  const cancelInstructionModal = (e) => {
    e.preventDefault()
    setInstructionName('')
    setShowModal(false)
  }

  const [editingInstruction, setEditingInstruction] = useState()

  const editInstructionClicked = (e, instruction, n) => {
    setEditingInstruction({name: instruction, index: n})
    setInstructionName(instruction)
    setModalContent('edit-intruction-modal')
    setShowModal(true)
  }

  const editInstructionConfirmed = (e) => {
    e.preventDefault()
    console.log(editingInstruction)
    console.log(instructionName)
    const mappedInstructions = currentData.recipe.instructions_list.map((instruction, n) => {
      if (instruction === editingInstruction.name && n === editingInstruction.index) {
        return instructionName
      }
      return instruction
    })
    setCurrentData({...currentData, recipe: {...currentData.recipe, instructions_list: mappedInstructions}})
    setShowModal(false)
    setEditingInstruction(null)
  }

  const editInstructionCancelled = (e) => {
    e.preventDefault()
    setShowModal(false)
    setEditingInstruction(null)
  }

  const [deleteInstructionID, setDeleteInstructionID] = useState()

  const deleteInstructionClicked = (e, instruction, n) => {
    setDeleteInstructionID(n)
    setModalContent('confirm-delete-instruction-moal')
    setShowModal(true)
  }

  const deleteInstructionConfirmed = (e) => {
    e.preventDefault()
    const filteredInstructions = currentData.recipe.instructions_list.filter((instruction, n_index) => n_index !== deleteInstructionID)
    setCurrentData({...currentData, recipe: {...currentData.recipe, instructions_list: filteredInstructions}})
    setDeleteInstructionID(null)
    setShowModal(false)
  }

  const deleteInstructionCancelled = (e) => {
    e.preventDefault()
    setShowModal(false)
  }

  return (
    <main className='create-edit-recipe-page'>
      <Modal show={showModal} setShow={setShowModal}>
        {/* Ingredient Modals */}
        {modalContent === 'ingredient-modal' &&
          <div className='fullwidth'>
            <p>Add Ingredient</p>
            <textarea value={ingredientName} className='component__input__small add-value__text-area' onChange={(e) => setIngredientName(e.target.value)}/>
            <div className='component__button-row'>
              <button onClick={cancelIngredientModal} className='component__large-button component__button-colour-discard'>Cancel</button>
              <button onClick={addIngredientModal} disabled={ingredientName===''} className='component__large-button component__button-colour-save'>Ok</button>
            </div>
          </div>
        }
        {modalContent === 'edit-ingredient-modal' &&
          <div className='fullwidth'>
            <p>Edit Ingredient</p>
            <textarea value={ingredientName} className='component__input__small add-value__text-area' onChange={(e) => setIngredientName(e.target.value)}/>
            <div className='component__button-row'>
              <button onClick={editIngredientCancelled} className='component__large-button component__button-colour-discard'>Cancel</button>
              <button onClick={editIngredientConfirmed} disabled={ingredientName===''} className='component__large-button component__button-colour-save'>Ok</button>
            </div>
          </div>
        }
        {modalContent === 'confirm-delete-ingredient-moal' &&
          <ConfirmationModal message='Are You Sure?' onConfirm={deleteIngredientConfirmed} onCancel={deleteIngredientCancelled}/>
        }
        {/* Instruction Modals */}
        {modalContent === 'instruction-modal' &&
          <div className='fullwidth'>
            <p>Add Instruction</p>
            <textarea value={instructionName} className='component__input__small add-value__text-area' onChange={(e) => setInstructionName(e.target.value)}/>
            <div className='component__button-row'>
              <button onClick={cancelInstructionModal} className='component__large-button component__button-colour-discard'>Cancel</button>
              <button onClick={addInstructionModal} disabled={instructionName===''} className='component__large-button component__button-colour-save'>Ok</button>
            </div>
          </div>
        }
        {modalContent === 'edit-intruction-modal' &&
          <div className='fullwidth'>
            <p>Edit Instruction</p>
            <textarea value={instructionName} className='component__input__small add-value__text-area' onChange={(e) => setInstructionName(e.target.value)}/>
            <div className='component__button-row'>
              <button onClick={editInstructionCancelled} className='component__large-button component__button-colour-discard'>Cancel</button>
              <button onClick={editInstructionConfirmed} disabled={instructionName==='' || instructionName === editingInstruction?.name} className='component__large-button component__button-colour-save'>Ok</button>
            </div>
          </div>
        }
        {modalContent === 'confirm-delete-instruction-moal' &&
          <ConfirmationModal message='Are You Sure?' onConfirm={deleteInstructionConfirmed} onCancel={deleteInstructionCancelled}/>
        }
      </Modal>
      <h2>{name}</h2>   
      <div className='component__button-row'>
        <button type='submit' onClick={onSaveClicked} disabled={disabledCheck()} className='component__large-button component__button-colour-save'>Save</button>
        <Link to='/app/recipes'><button className='component__large-button component__button-colour-discard'>Discard</button></Link>
      </div>
      <section className='component__container__wide recipe-options'>
        <label className='recipe-options__label'>Name Of Recipe</label>
        <input value={currentData.recipe.title} placeholder="(required)" onChange={(e) => setCurrentData({...currentData, recipe: {...currentData.recipe, title: e.target.value}})} className='component__input__small'/>
        <label className='recipe-options__label'>Recipe Description</label>
        <textarea value={currentData.recipe.description} onChange={(e) => setCurrentData({...currentData, recipe: {...currentData.recipe, description: e.target.value}})} className='component__input__small recipe-options__text-area'/>
        <label className='recipe-options__label'>URL (if applicable)</label>
        <input value={currentData.recipe.url} placeholder="https://..." onChange={(e) => setCurrentData({...currentData, recipe: {...currentData.recipe, url: e.target.value}})} className='component__input__small'/>
        <label className='recipe-options__label'>Image URL</label>
        <input value={currentData.recipe.image} placeholder="https://..." onChange={(e) => setCurrentData({...currentData, recipe: {...currentData.recipe, image: e.target.value}})} className='component__input__small'/>
        
        
        <h3>Information</h3>
        <div className='stats__row'>
          <label htmlFor='preptime'>Prep Time</label>
          <input value={prepTime} onChange={(e) => setPrepTime(e.target.value.replace(/[^0-9]/g, ''))} onBlur={updatePrepTime}/>
          <p>minutes</p>
        </div>
        <div className='stats__row'>
          <label htmlFor='preptime'>Cook Time</label>
          <input value={cookTime} onChange={(e) => setCookTime(e.target.value.replace(/[^0-9]/g, ''))} onBlur={updateCookTime}/>
          <p>minutes</p>
        </div>
        <div className='stats__row'>
          <label htmlFor='preptime'>Total Time</label>
          <input value={totalTime} onChange={(e) => setTotalTime(e.target.value.replace(/[^0-9]/g, ''))} onBlur={updateTotalTime}/>
          <p>minutes</p>
        </div>
        <div className='stats__row'>
          <label htmlFor='preptime'>Yields</label>
          <input value={yields} onChange={(e) => setYields(e.target.value.replace(/[^0-9]/g, ''))} onBlur={updateYields}/>
          <p>Servings</p>
        </div>
        
        <h3>Ingredients</h3>
        <table className='component__table'>
          <thead className='component__table-thead'>
            <tr className='component__table-row component__table-heading'>
              <th className='component__table-item'>Ingredients</th>
            </tr>
          </thead>
          <tbody className='component__table-tbody'>
            {[].concat(...currentData.recipe.ingredient_groups.map(group => group.ingredients.map((ingredient, n) => ({name: ingredient, group: group.purpose, index: n})))).map((ingredient, n) => 
            <tr key={n} className='component__table-row'>
              <td className='component__table-item component__table-item-no-overflow'>
                <div className='table-item'>
                  <p className='ingredient'>{ingredient.name}</p>
                  <div className='table-buttons'>
                    <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => editIngredientClicked(e, ingredient, n)} className='excluded-ingredients__button'/>
                    <FontAwesomeIcon icon={faTrashCan} onClick={(e) => deleteIngredientClicked(e, ingredient, n)} className='excluded-ingredients__button excluded-ingredients__button-delete'/>
                  </div>
                </div>  
              </td>
            </tr>)}
            <tr className='component__table-row'>
              <td className='component__table-item'><FontAwesomeIcon icon={faPlusCircle} onClick={newIngredientClicked}/></td>
            </tr>
          </tbody>
        </table>

        <h3>Instructions</h3>
        <table className='component__table'>
          <thead className='component__table-thead'>
            <tr className='component__table-row component__table-heading'>
              <th className='component__table-item'>Instructions</th>
            </tr>
          </thead>
          <tbody className='component__table-tbody'>
            {currentData.recipe.instructions_list.map((instruction, n) => 
            <tr key={n} className='component__table-row'>
              <td className='component__table-item component__table-item-no-overflow'>
                <div className='table-item'>
                  <p className='instruction'>{instruction}</p>
                  <div className='table-buttons'>
                    {n !== 0 && <FontAwesomeIcon icon={faArrowUp} onClick={(e) => moveInstructionUp(e, instruction, n)} className='excluded-ingredients__button'/>}
                    {n !== currentData.recipe.instructions_list.length - 1 && <FontAwesomeIcon icon={faArrowDown} onClick={(e) => moveInstructionDown(e, instruction, n)} className='excluded-ingredients__button'/>}
                    <FontAwesomeIcon icon={faPenToSquare} onClick={(e) => editInstructionClicked(e, instruction, n)} className='excluded-ingredients__button'/>
                    <FontAwesomeIcon icon={faTrashCan} onClick={(e) => deleteInstructionClicked(e, instruction, n)} className='excluded-ingredients__button excluded-ingredients__button-delete'/>
                  </div>
                </div>
              </td>
            </tr>)}
            <tr className='component__table-row'>
              <td className='component__table-item'><FontAwesomeIcon icon={faPlusCircle} onClick={newInstructionClicked}/></td>
            </tr>
          </tbody>
        </table>
      </section>
      <div className='component__button-row'>
        <button type='submit' onClick={onSaveClicked} disabled={disabledCheck()} className='component__large-button component__button-colour-save'>Save</button>
        <Link to='/app/recipes'><button className='component__large-button component__button-colour-discard'>Discard</button></Link>
      </div>
    </main>
  )
}

export default CreateEditRecipeCommon