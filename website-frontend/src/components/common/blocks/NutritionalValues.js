import './NutritionalValues.css'

const NutritionalValues = ({ ingredientData, setIngredientData }) => {
  const nutrition = ingredientData.user

  const updateIngredientData = ({ type, name }) => {
    const current = ingredientData.user[`${name}_low_high`]
    if (type === 'low') {
      // var newSetting = `${1 - Number(current[0])}${current[1]}`
      var newSetting = `${1 - Number(current[0])}0`
    } else if (type === 'high') {
      // var newSetting = `${current[0]}${1 - Number(current[1])}`
      var newSetting = `0${1 - Number(current[1])}`
    } else {
      return console.error('type is not high or low')
    }
    setIngredientData({...ingredientData, 'user': {...nutrition, [`${name}_low_high`]:newSetting}})
  }

  return (
    <div className='settings__nutrition-checkboxes'>
      <div>
        <input id='calorie-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.calorie_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'calorie' })}
        />
        <label htmlFor='calorie-low'>Low Calorie</label>
      </div>
      <div>
        <input id='calorie-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.calorie_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'calorie' })}
        />
        <label htmlFor='calorie-high'>High Calorie</label>
      </div>
      
      <div>
        <input id='carb-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.carboydrate_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'carboydrate' })} // this is mispelled as i cant be bothered updating it everywhere
        />
        <label htmlFor='carb-low'>Low Carbohydrates</label>
      </div>
      <div>
        <input id='carb-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.carboydrate_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'carboydrate' })}
        />
        <label htmlFor='carb-high'>High Carbohydrates</label>
      </div>
      
      <div>
        <input id='protein-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.protein_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'protein' })}
        />
        <label htmlFor='protein-low'>Low Protein</label>
      </div>
      <div>
        <input id='protein-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.protein_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'protein' })}
        />
        <label htmlFor='protein-high'>High Protein</label>
      </div>

      <div>
        <input id='cholesterol-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.cholesterol_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'cholesterol' })}
        />
        <label htmlFor='cholesterol-low'>Low Cholesterol</label>
      </div>
      <div>
        <input id='cholesterol-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.cholesterol_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'cholesterol' })}
        />
        <label htmlFor='cholesterol-high'>High Cholesterol</label>
      </div>
      
      <div>
        <input id='sodium-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.sodium_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'sodium' })}
        />
        <label htmlFor='sodium-low'>Low Sodium</label>
      </div>
      <div>
        <input id='sodium-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.sodium_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'sodium' })}
        />
        <label htmlFor='sodium-high'>High Sodium</label>
      </div>
      
      <div>
        <input id='sugar-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.sugar_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'sugar' })}
        />
        <label htmlFor='sugar-low'>Low Sugar</label>
      </div>
      <div>
        <input id='sugar-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.sugar_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'sugar' })}
        />
        <label htmlFor='sugar-high'>High Sugar</label>
      </div>
      
      <div>
        <input id='fat-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.fat_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'fat' })}
        />
        <label htmlFor='fat-low'>Low Fat</label>
      </div>
      <div>
        <input id='fat-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.fat_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'fat' })}
        />
        <label htmlFor='fat-high'>High Fat</label>
      </div>

      <div> 
        <input id='fibre-low' type='checkbox' className='component__checkbox' 
          checked={nutrition.fibre_low_high[0] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'low', name: 'fibre' })}
        />
        <label htmlFor='fibre-low'>Low Fibre</label>
      </div>
      <div>
        <input id='fibre-high' type='checkbox' className='component__checkbox' 
          checked={nutrition.fibre_low_high[1] === '1'} 
          onChange={(e) => updateIngredientData({ type: 'high', name: 'fibre' })}
        />
        <label htmlFor='fibre-high'>High Fibre</label>
      </div>
    </div>
  )
}

export default NutritionalValues