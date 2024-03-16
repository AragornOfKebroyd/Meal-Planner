import './DietaryPreferences'

const DietaryPreferences = ({ ingredientData, setIngredientData }) => {
  return (
    <div className='settings__dietery-preference' onChange={(e) => {
      const pref = e.target.value
      const updatePref = prefData => setIngredientData({...ingredientData, 'user': {...ingredientData.user, ...prefData}})
      switch (pref) {
        case 'none':
          updatePref({'vegan': 0, 'vegetarian': 0})
          break
        case 'vegetarian':
          updatePref({'vegan': 0, 'vegetarian': 1})
          break
        case 'vegan':
          updatePref({'vegan': 1, 'vegetarian': 0})
          break
        default:
          break
      }
    }}>
      <input id='none' value='none' type='radio' name='diet' className='component__radio' checked={!ingredientData.user.vegetarian && !ingredientData.user.vegan} onChange={(e) => {}}/>
      <label htmlFor='none'>None</label>

      <input id='vegetarian' value='vegetarian' type='radio' name='diet' className='component__radio' checked={ingredientData.user.vegetarian} onChange={(e) => {}}/>
      <label htmlFor='vegetarian'>Vegetarian</label>
      
      <input id='vegan' value='vegan' type='radio' name='diet' className='component__radio' checked={ingredientData.user.vegan} onChange={(e) => {}}/>
      <label htmlFor='vegan'>Vegan</label>
    </div>
  )
}

export default DietaryPreferences