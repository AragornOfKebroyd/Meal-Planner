import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const Star = ({ marked, starId, setSelection, setRating }) => {
  return (
    <FontAwesomeIcon 
      icon={faStar} 
      className={`component__icon ${marked ? 'reicpe-icon__star-filled' : 'reicpe-icon__star-empty'}`} 
      onMouseOver={(e) => setSelection(starId)} 
      onClick={(e) => setRating(starId)}/>
  )
}

const StarRating = ({rating, setRating}) => {
  const [selection, setSelection] = useState(0);

  useEffect(() => {
    setSelection(0)
  }, [rating])

  return (
    <div
      onMouseOut={(e) => setSelection(rating)}
      className='star_row'
    >
      {Array.from({ length: 5 }, (v, i) => (
        <Star
          starId={i + 1}
          key={`star_${i + 1}`}
          setSelection={setSelection}
          setRating={setRating}
          marked={selection ? selection >= i + 1 : rating >= i + 1}
        />
      ))}
    </div>
  );
}

export default StarRating