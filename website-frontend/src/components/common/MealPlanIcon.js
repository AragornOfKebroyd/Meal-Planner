const MealPlanIcon = ({mealPlanData, selected, active, greyed, setCurrentPlanData}) => {
  const planSelected = selected || false
  const planActive = active || false
  const planGreyed = greyed || false

  const onMealPlanClicked = (e) => {
    setCurrentPlanData(mealPlanData)
  }

  return (
    <div className='meal-plan-icon__wrapper' onClick={onMealPlanClicked}>
      <div className={`meal-plan-icon__button ${planSelected ? 'meal-plan-icon__selected' : ''}`} />
      {planActive && <div className={`meal-plan-icon__green-top-bar ${planSelected ? 'meal-plan-icon__selected' : ''}`} />}
      {planGreyed && <div className='meal-plan-icon__greyed-out' />}
      <div className='meal-plan-icon__name'>
        <p className='meal-plan-icon__name__text'>{mealPlanData.name}</p>
        {planSelected
          ? <img src='/icons/meal_black.svg' alt='meal' className='meal-icon'/>
          : <img src='/icons/meal.svg' alt='meal' className='meal-icon'/>}
      </div>
    </div>
  )
}

export default MealPlanIcon