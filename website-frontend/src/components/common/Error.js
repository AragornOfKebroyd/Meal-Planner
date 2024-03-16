import './Common.css'

const Error = (props) => {
  let content = "Error"
  if (props.message) {
    content = props.message
  }
  else if (props.error) {
    if (props.error.error) {
      content = props.error.error
    } else if (props.error.data.message) {
      content = props.error.data.message
    }
  }
  return (
    <p className='error-message'>{content}</p>
  )
}

export default Error