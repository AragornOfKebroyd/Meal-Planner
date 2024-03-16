import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate, faSquareMinus } from '@fortawesome/free-solid-svg-icons'
import '../Common.css'

const NO_IMAGE = 'https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6-300x188.png'
const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

const ExchangeRecipeIcon = ({recipe, className, setSelectedRecipe, setType, path, active}) => {
  const recipeSelected = () => {
    setType('add')
    setSelectedRecipe(path)
  }

  const removeSelected = () => {
    setType('rem')
    setSelectedRecipe(path)
  }

  let content
  if (recipe) {
    console.log(recipe.image)
    const image = useImage 
      ? recipe.image 
        ? recipe.image
        : DEFAULT_IMAGE
      : DEFAULT_IMAGE
    content = ( // recipeID, title, user_recipe, url, website, image, prep_time, cook_time, total_time, ratings, description, servingSize, yields, yield_number, author, instructions_list, ingredient_groups, calories, carbohydrateContent, proteinContent, fatContent, sodiumContent, cholesterolContent, saturatedFatContent, sugarContent, fiberContent, unsaturatedFatContent, transFatContent
      <>
        <div className='recipe-icon__top'>
          <div>
            <img src={image} alt="recipe" className='recipe-icon__image' onError={(e)=>{
                e.target.onError = null
                e.target.src = NO_IMAGE
              }}/>
          </div>
        </div>
        <div className='recipe-icon__bottom'>
          <p className='recipe-icon__title'>{recipe.title}</p>
          <div className='reicpe-icon__row'>
            <FontAwesomeIcon icon={faRotate} className='rotateicon' onClick={recipeSelected}/>
            <FontAwesomeIcon icon={faSquareMinus} onClick={removeSelected}/>
          </div>
        </div>
      </>
    )
  } else {
    const image = useImage ? NO_IMAGE : DEFAULT_IMAGE
    content = 
      <div>
        <img src={image} alt="error" className='recipe-icon__image' />
      </div>
  }
  
  return (
    <div className={`recipe-icon recipe-select-icon ${className ? className : ''}`}>
      {content}
      {!active && <div className='recipe-icon-greyed-out'/>}
    </div>
  )
}

export default ExchangeRecipeIcon