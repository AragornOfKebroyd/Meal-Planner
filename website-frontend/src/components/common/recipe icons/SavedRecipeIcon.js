import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import '../Common.css'
import InfoIcon from './common/InfoIcon'

const NO_IMAGE = 'https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6-300x188.png'
const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

const SavedRecipeIcon = ({recipe, className}) => {
  let content
  if (recipe) {
    const image = useImage 
      ? recipe.image 
        ? recipe.image
        : DEFAULT_IMAGE
      : DEFAULT_IMAGE
    content = ( // recipeID, title, user_recipe, url, website, image, prep_time, cook_time, total_time, ratings, description, servingSize, yields, yield_number, author, instructions_list, ingredient_groups, calories, carbohydrateContent, proteinContent, fatContent, sodiumContent, cholesterolContent, saturatedFatContent, sugarContent, fiberContent, unsaturatedFatContent, transFatContent
      <>
        <div className='recipe-icon__top'>
          <Link to={`/app/recipes/${recipe.recipeID}`}><img src={image} alt="recipe" className='recipe-icon__image' onError={(e)=>{
                e.target.onError = null
                e.target.src = NO_IMAGE
              }}/></Link>
          <InfoIcon recipe={recipe} />
        </div>
        <div className='recipe-icon__bottom'>
          <p className='recipe-icon__title recipe-icon__title-two'>{recipe.title}</p>
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
    <div className={`recipe-icon ${className ? className : ''}`}>
      {content}
    </div>
  )
}

export default SavedRecipeIcon