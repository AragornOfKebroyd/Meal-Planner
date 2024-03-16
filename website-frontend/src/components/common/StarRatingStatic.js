import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Star = ({ markedProportion }) => {
  if (markedProportion === 0) {
    return <FontAwesomeIcon icon={faStar} className='component__icon reicpe-icon__star-empty'/>
  }
  if (markedProportion === 1) {
    return <FontAwesomeIcon icon={faStar} className='component__icon reicpe-icon__star-filled'/>
  }

  const percentageFilled = Math.round(markedProportion * 100)
  const percentageEmpty = 100 - percentageFilled

  return (
    <div>
      <FontAwesomeIcon icon={faStar} className='component__icon reicpe-icon__star-filled' style={{clipPath: `inset(0 ${percentageEmpty}% 0 0)`, position:'absolute'}}/>
      <FontAwesomeIcon icon={faStar} className='component__icon reicpe-icon__star-empty' style={{clipPath: `inset(0 0 0 ${percentageFilled}%)`, position:'absolute'}}/>
    </div>
  )
}

const StaticStarRating = ({rating, setRating}) => {

  const starFullness = (rating, starNumber) => {
    if (starNumber > (rating + 1)) {
      return 0
    }
    if (starNumber < rating) {
      return 1
    } // rating: 3.6, star = 3 = full, star = 4 = 1 - (5 - 4.6) star = 5 > 3.6 + 1
    return 1 - (starNumber - rating)
  }

  return (
    <div className='star_row'>
      {Array.from({ length: 5 }, (v, i) => (
        <Star
          key={`star_${i + 1}`}
          markedProportion={starFullness(rating, i + 1)}
        />
      ))}
    </div>
  );
}

export default StaticStarRating