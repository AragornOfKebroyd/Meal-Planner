import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import { useEffect } from "react"

const Modal = ({ children, show, setShow }) => {

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      modalClosed()
    }
  }

  const modalClosed = (e) => {
    document.body.style.overflow = "scroll"
    document.removeEventListener("keydown", handleKeyPress, false)
    setShow(false)
  }

  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleKeyPress, false)
      document.body.style.overflow = "hidden"
    } else {
      modalClosed()
    }
  }, [show])

  // When the thing is closed it will run modalClosed
  useEffect(() => {
    return modalClosed
  }, [])

  return (
    <div className={`modal ${show ? 'modal-show' : ''}`}>
      <div className="modal__content">
        <FontAwesomeIcon icon={faClose} className='modal__close'onClick={modalClosed}/>
        {children}
      </div>
    </div>
  )
}

export default Modal