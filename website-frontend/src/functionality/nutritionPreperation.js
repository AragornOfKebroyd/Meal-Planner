// Coutresy of chat gippty
const LOW_NUTRITION_VALUES = {
  'calorie': 300,
  'carboydrate' : 10,
  'protein' : 10,
  'cholesterol' : 30,
  'sodium' : 300,
  'sugar' : 5,
  'fat' : 10,
  'fiber' : 5
}
const HIGH_NUTRITION_VALUES = {
  'calorie': 500,
  'carboydrate' : 20,
  'protein' : 20,
  'cholesterol' : 60,
  'sodium' : 600,
  'sugar' : 15,
  'fat' : 20,
  'fiber' : 15
}

const equality_type = {
  '01': '>=',
  '10': '<=',
  '00': false
}

const getRestriction = (type, name) => {
  if (type === '<=') return LOW_NUTRITION_VALUES[name]
  if (type === '>=') return HIGH_NUTRITION_VALUES[name]
}

export const prepareNutrients = (userData) => {
  var preparedNutrients = {}
  
  const calorieType = equality_type[userData.user.calorie_low_high]
  const calorieRestriction = getRestriction(calorieType, 'calorie')
  if (calorieType) preparedNutrients['calories'] = [calorieType, `${calorieRestriction} * recipe.yield_number`]

  const carbohydrateType = equality_type[userData.user.carboydrate_low_high]
  const carbohydrateRestriction = getRestriction(carbohydrateType, 'carboydrate')
  if (carbohydrateType) preparedNutrients['carbohydrateContent'] = [carbohydrateType, `${carbohydrateRestriction} * recipe.yield_number`]
  
  const cholesterolType = equality_type[userData.user.cholesterol_low_high]
  const cholesterolRestriction = getRestriction(cholesterolType, 'cholesterol')
  if (cholesterolType) preparedNutrients['cholesterolContent'] = [cholesterolType, `${cholesterolRestriction} * recipe.yield_number`]
  
  const fatType = equality_type[userData.user.fat_low_high]
  const fatRestriction = getRestriction(fatType, 'fat')
  if (fatType) preparedNutrients['fatContent'] = [fatType, `${fatRestriction} * recipe.yield_number`]
  
  const fiberType = equality_type[userData.user.fibre_low_high]
  const fiberRestriction = getRestriction(fiberType, 'fiber')
  if (fiberType) preparedNutrients['fiberContent'] = [fiberType, `${fiberRestriction} * recipe.yield_number`]
  
  const proteinType = equality_type[userData.user.protein_low_high]
  const proteinRestriction = getRestriction(proteinType, 'protein')
  if (proteinType) preparedNutrients['proteinContent'] = [proteinType, `${proteinRestriction} * recipe.yield_number`]
  
  const sodiumType = equality_type[userData.user.sodium_low_high]
  const sodiumRestriction = getRestriction(sodiumType, 'sodium')
  if (sodiumType) preparedNutrients['sodiumContent'] = [sodiumType, `${sodiumRestriction} * recipe.yield_number`]
  
  const sugarType = equality_type[userData.user.sugar_low_high]
  const sugarRestriction = getRestriction(sugarType, 'sugar')
  if (sugarType) preparedNutrients['sugarContent'] = [sugarType, `${sugarRestriction} * recipe.yield_number`]

  return preparedNutrients
}