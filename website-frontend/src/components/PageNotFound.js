import './PageNotFound.css'
import { Link } from 'react-router-dom'

const cod = 'https://s3.eu-west-1.amazonaws.com/media.mcsuk.org/images/Cod_Atlantic_M_960.2e16d0ba.fill-600x600.png'

const PageNotFound = () => {
  return (
    <div className='page-not-found'>
      <h1 className='page-not-found__404'>404</h1>
      <img src={cod} alt='cod' className='fish-404'/>
      <p className='page-not-found__text'>Sorry, that page does not exist</p>
      <Link to='/app' className='page-not-found__back'>Home</Link>
    </div>
  )
}

export default PageNotFound