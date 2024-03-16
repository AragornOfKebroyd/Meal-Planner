import { faSquarePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const SelectBlankIcon = ({icon, className, setSelectedRecipe, path, active}) => {
  const recipeSelected = () => {
    setSelectedRecipe(path)
  }

  return (
    <div className={`blank-icon recipe-select-icon ${className ? className : ''}`} onClick={recipeSelected}>
      <FontAwesomeIcon icon={icon ? icon : faSquarePlus} className='rotateicon'/>
      {!active && <div className='recipe-icon-greyed-out'/>}
    </div>
  )
}

export default SelectBlankIcon