import { useSelector } from 'react-redux'
import { useDeleteMealPlanMutation, useGetAllUserMealPlansQuery, useSetActiveMealPlanMutation } from '../../../app/services/meal_plansApiSlice'
import './MealPlanLibrary.css'

import { useEffect, useState } from 'react'
import { selectCurrentUser } from '../../../app/state/authSlice'
import Spinner from '../../common/Spinner'
import MealPlan from '../../common/blocks/MealPlan'
import MealPlanIcon from '../../common/MealPlanIcon'
import { Link } from 'react-router-dom'
import Modal from '../../common/Modal'
import ConfirmationModal from '../../common/modals/ConfirmationModal'

const MealPlanLibrary = () => {
  const userID = useSelector(selectCurrentUser).userID

  const {data: getMealPlansData, isSuccess: isGetUserMealPlansSuccess} = useGetAllUserMealPlansQuery(userID)
  const [setActiveMealPlan, {isSuccess: isSetActiveMealPlanSuccess, isLoading: isSetActiveMealPlanLoading }] = useSetActiveMealPlanMutation()

  const [mealPlanData, setMealPlanData] = useState({})
  const [currentPlanData, setCurrentPlanData] = useState()
  const [display, setDisplay] = useState(false)
  const [hasCurrentPlan, setHasCurrentPlan] = useState(false)

  useEffect(() => {
    if (isGetUserMealPlansSuccess) {
      // For when a user has just registered, they will not have any active meal plan
      if (getMealPlansData.meal_plans.filter(meal_plan => meal_plan.active).length === 0) {
        setHasCurrentPlan(false)
      } else {
        setHasCurrentPlan(true)
      }
      // set the current state of the meal plan data
      setMealPlanData(getMealPlansData)
    }
  }, [isGetUserMealPlansSuccess])
  
  useEffect(() => {
    if (isGetUserMealPlansSuccess && Object.keys(mealPlanData).length) {
      if (hasCurrentPlan) {
        const activeData = mealPlanData.meal_plans.filter(meal_plan => meal_plan.active)[0]
        setCurrentPlanData(activeData)
      }
      setDisplay(true)
    }
  }, [mealPlanData])

  const mealPlanSetAsActive = (e, meal_planID) => {
    e.preventDefault()
    setMealPlanData({...mealPlanData, meal_plans: mealPlanData.meal_plans.map(meal_plan => ({...meal_plan, active: meal_plan.meal_planID === meal_planID}))})
    setActiveMealPlan({userID, meal_planID: currentPlanData.meal_planID})
    setHasCurrentPlan(true)
  }


  // delete meal plan

  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState()

  const [deleteMealPlan, {isSuccess: isDeleteMealPlanSuccess,isError: isDeleteMealPlanError}] = useDeleteMealPlanMutation()
  const [deletedID, setDeletedID] = useState(null)

  const deleteButtonClicked = () => {
    if (currentPlanData.active) {
      alert('You cannot delete your active meal plan. Please set another meal plan as active first.')
    } else {
      setModalContent('confirm-delete')
      setShowModal(true)
    }
  }

  const deleteMealPlanConfirmed = (e) => {
    e.preventDefault()
    deleteMealPlan({userID, meal_planID: currentPlanData.meal_planID})
    setDeletedID(currentPlanData.meal_planID)
    setShowModal(false)
  }


  useEffect(() => {
    if (isDeleteMealPlanSuccess) {
      setMealPlanData({...mealPlanData, meal_plans: mealPlanData.meal_plans.filter(meal_plan => meal_plan.meal_planID !== deletedID)})
      const activeData = getMealPlansData.meal_plans.filter(meal_plan => meal_plan.active)[0]
      setCurrentPlanData(activeData)
    }
  }, [isDeleteMealPlanSuccess])


  return (
    <main className='meal-plan-library-page'>
      {/* MODAL */}
      <Modal show={showModal} setShow={setShowModal}>
        {modalContent === 'confirm-delete' &&
          <ConfirmationModal message={'Are You Sure?'} onConfirm={deleteMealPlanConfirmed} onCancel={(e) => setShowModal(false)}/>
        }
      </Modal>
      <h2>Meal Plans</h2>
      <section className='component__container__wide meal-plan-library__meal-plan-icons'>
        {display
          ? <>
              {mealPlanData.meal_plans.map((meal_plan, n) => 
              <div key={n}>
                <MealPlanIcon mealPlanData={meal_plan} setCurrentPlanData={setCurrentPlanData} active={meal_plan.active} selected={meal_plan.meal_planID === currentPlanData?.meal_planID}/>
              </div>)}
              <Link to={`/app/meal-plans/create`}><button className='add-new-meal-plan-button'>+</button></Link>
            </>
          : <Spinner />
        }
      </section>
      <h3>{display ? currentPlanData?.name : 'Loading...'}</h3>
      {hasCurrentPlan && <>
        <section className='component__container__wide'>
        {display
          ? mealPlanData && <MealPlan meal_plan={mealPlanData.formatted[currentPlanData.meal_planID]} />
          : <Spinner />
        }
        </section>
      </>}
      {display && currentPlanData && <>
      <div className='component__button-row'>
        <Link to={`/app/meal-plans/${currentPlanData.meal_planID}/edit`}><button className='component__large-button component__button-colour-orange'>Edit</button></Link>
        <Link to={`/app/meal-plans/${currentPlanData.meal_planID}`}><button className='component__large-button component__button-colour-orange'>Open</button></Link>
        <Link to={`/app/shopping-list/${currentPlanData.meal_planID}`}><button className='component__large-button component__button-colour-orange'>Shopping List</button></Link>
      </div>
      <div className='component__button-row'>
        <button className='component__large-button component__button-colour-dark-orange' disabled={currentPlanData.active} onClick={(e) => mealPlanSetAsActive(e, currentPlanData.meal_planID)}>Set As Current</button>
        <button className='component__large-button component__button-colour-discard' onClick={deleteButtonClicked}>Delete</button>
      </div>
      </>}  
    </main>
  )
}

export default MealPlanLibrary