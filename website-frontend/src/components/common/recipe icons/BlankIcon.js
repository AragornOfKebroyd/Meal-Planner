import '../Common.css'

const BlankIcon = (props) => {
  return (
    <div className={`blank-icon ${props?.className ? props.className : ''}`}>
      <img src="/icons/minus.svg" alt="minus" className='blank-icon__minus-icon' />
    </div>
  )
}

export default BlankIcon