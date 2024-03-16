import React from 'react'

const ConfirmationModal = ({message, onConfirm, onCancel}) => {
  return (
    <>
      <h2 className='modal_padding'>{message}</h2>
      <div className='component__button-row'>
        <button onClick={onCancel} className='component__large-button component__button-colour-grey'>Cancel</button>
        <button onClick={onConfirm} className='component__large-button component__button-colour-discard'>Delete</button>
      </div>
    </>
  )
}

export default ConfirmationModal