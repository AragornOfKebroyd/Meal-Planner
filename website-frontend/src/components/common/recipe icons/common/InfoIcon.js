import { faCircleInfo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const InfoIcon = ({recipe}) => {
  return (
    <div className='recipe-icon__info__container hoverable'>
      <FontAwesomeIcon icon={faCircleInfo} className='recipe-icon__info' />
      <div className='info-box'>
        {recipe.url ? <a href={recipe.url} className='info-box__title' target='_blank' rel='noreferrer noopener'>{recipe.title}</a> : <p className="info-box__title">{recipe.title}</p>}
        {recipe.total_time ? <p className='info-box__text'>Time: {recipe.total_time} minutes</p> : ''}
        {recipe.ratings ? <p className='info-box__text'>Rating: {recipe.ratings}/5</p> : ''}
        {recipe.yields ? <p className='info-box__text'>Yields: {recipe.yields}</p> : ''}
        {recipe.author ? <p className='info-box__text'>By: {recipe.author}</p> : ''}
      </div>
    </div>
  )
}

export default InfoIcon