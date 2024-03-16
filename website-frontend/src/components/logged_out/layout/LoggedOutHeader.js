import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"

import { useLazyGetUserQuery } from '../../../app/services/usersApiSlice'
import { useLoginMutation } from '../../../app/services/authApiSlice'
import { loginSuccess } from '../../../app/state/authSlice'

const LoggedOutHeader = () => {
  const [getUser] = useLazyGetUserQuery()
  const [login] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loginButtonClicked = (e) => {
    e.preventDefault()
    navigate('/login')
  }

  const registerButtonClicked = (e) => {
    e.preventDefault()
    navigate('/register')
  }

  const magic = async (e) => {
    e.preventDefault()
    try {
      const token = await login({ username: 'Aragorn', password: '1234' }).unwrap()
      const user = await getUser({ userID: token.userID }).unwrap()
      dispatch(loginSuccess({ userData: user })) // store user data
      navigate('/app')
    } catch (err) {
      console.error(err)
    }
  }

  const magicLogin = Boolean(Number(process.env.REACT_APP_MAGIC_LOGIN))
  
  return (
    <header className="logged-out-header">
      <div className='logged-out-header__wrapper'>
        <Link to='/' style={{ textDecoration: 'none' }}><h1 className='logged-out-header__main-text'>Meal Planner</h1></Link>
        <Link to='/' style={{ textDecoration: 'none' }}><img src="/icons/meal.svg" alt="meal" className='logged-out-header__icon'/></Link>
      </div>
      {magicLogin && <button onClick={magic} className="component__large-button component__button-colour-save">Magic Login</button>}
      <div className='logged-out-header__right'>
        <button onClick={registerButtonClicked} className='logged-out-header__right__button component__large-button'>Register</button>
        <button onClick={loginButtonClicked} className='logged-out-header__right__button component__large-button' >Login</button>
      </div>
    </header>
  )
}

export default LoggedOutHeader