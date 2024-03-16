import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../Common.css'

const ExchangeBlankIcon = ({className, setSelectedRecipe, setType, path, active}) => {
  const recipeSelected = () => {
    setType('add')
    setSelectedRecipe(path)
  }

  return (
    <div className={`blank-icon recipe-select-icon ${className ? className : ''}`} onClick={recipeSelected}>
      <FontAwesomeIcon icon={faRotate} className='rotateicon'/>
      {!active && <div className='recipe-icon-greyed-out'/>}
    </div>
  )
}

export default ExchangeBlankIcon