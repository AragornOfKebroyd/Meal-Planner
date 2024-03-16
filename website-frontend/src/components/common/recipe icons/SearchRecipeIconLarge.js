import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCirclePlus } from '@fortawesome/free-solid-svg-icons'

import { Link } from 'react-router-dom'
import '../Common.css'
import useSaveRecipe from '../../../hooks/useSaveRecipe'

const NO_IMAGE = 'https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6-300x188.png'
const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

const SearchRecipeIconLarge = ({recipe, selectRecipe, className}) => {
  const [saved, saveRecipeClicked, unsaveRecipeClicked] = useSaveRecipe(recipe.recipeID)

  
  let content
  if (recipe) {
    const image = useImage 
      ? recipe.image 
        ? recipe.image
        : DEFAULT_IMAGE
      : DEFAULT_IMAGE
    content = ( // recipeID, title, user_recipe, url, website, image, prep_time, cook_time, total_time, ratings, description, servingSize, yields, yield_number, author, instructions_list, ingredient_groups, calories, carbohydrateContent, proteinContent, fatContent, sodiumContent, cholesterolContent, saturatedFatContent, sugarContent, fiberContent, unsaturatedFatContent, transFatContent
      <div className='recipe-icon-large-grid'>  
        <Link to={`/app/recipes/${recipe.recipeID}`} className='image-container-large'>
          <img src={image} alt="recipe" className='recipe-icon__image' onError={(e)=>{
                e.target.onError = null
                e.target.src = NO_IMAGE
              }}/>
        </Link>
        <div className='info-sidebar'>
          <Link to={`/app/recipes/${recipe.recipeID}`}><p className='info-large__title info-link-text'>{recipe.title}</p></Link>
          {recipe.prep_time ? <p className='info-large__text'>Prep Time: {recipe.prep_time} minutes</p> : ''}
          {recipe.cook_time ? <p className='info-large__text'>Cook Time: {recipe.cook_time} minutes</p> : ''}
          {recipe.total_time ? <p className='info-large__text'>Total Time: {recipe.total_time} minutes</p> : ''}
          {recipe.ratings ? <p className='info-large__text'>Rating: {recipe.ratings}/5</p> : ''}
          {recipe.yields ? <p className='info-large__text'>Yields: {recipe.yields}</p> : ''}
          {recipe.author ? <p className='info-large__text'>By: {recipe.author}</p> : ''}
          {recipe.url && <><a href={recipe.url} className='info-link-text info-large__text' target='_blank' rel='noreferrer noopener'>Open Link</a></>}
          <div className='info-sidebar-icons'>
            <FontAwesomeIcon icon={faCirclePlus} className='addicon iconlarge' onClick={(e) => selectRecipe(recipe)}/>
            {saved
              ? <img src="/icons/savedBookmark.svg" alt="savedbookmark" className='bookmarkicon iconlarge' onClick={unsaveRecipeClicked}/> 
              : <img src="/icons/unsavedBookmark.svg" alt="unsavedbookmark" className='bookmarkicon iconlarge' onClick={saveRecipeClicked}/> 
            }
          </div>
        </div>
        <div className='large-icon-bottom'>
          <h4 className='recipe-icon__title-two'>{recipe.title}</h4>
          <div className='large-icon-rating'>
            {recipe.ratings
              ? <>
                  <p className='user-rating-large-icon'>Users Rated This Recipe {recipe.ratings} / 5</p>
                  <div className='reicpe-icon__star-row'>
                    {recipe.ratings ? [...Array(5).keys()].map(n => 
                      <FontAwesomeIcon icon={faStar} className={`reicpe-icon__star ${n + 1 <= Math.round(recipe.ratings) ? 'reicpe-icon__star-filled' : 'reicpe-icon__star-empty'}`} key={n}/>
                    ) : ''}
                  </div>
                </>
              : <p>No Ratings</p>}
          </div>
        </div>
      </div>
    )
  } else {
    const image = useImage ? NO_IMAGE : DEFAULT_IMAGE
    content = 
      <div>
        <img src={image} alt="error" className='recipe-icon__image' />
      </div>
  }
  
  return (
    <div className={`recipe-icon recipe-icon-large ${className ? className : ''}`}>
      {content}
    </div>
  )
}

export default SearchRecipeIconLarge