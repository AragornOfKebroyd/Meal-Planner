import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { useLazyGetUserQuery } from '../../app/services/usersApiSlice'
import { useLoginMutation } from '../../app/services/authApiSlice'
import Error from '../common/Error'
import { loginSuccess } from '../../app/state/authSlice'

import './Login-Register.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const onUsernameChanged = (e) => setUsername(e.target.value)
  const onPasswordChanged = (e) => setPassword(e.target.value)


  const [getUser] = useLazyGetUserQuery()
  const [login] = useLoginMutation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    setErrMsg('')
  }, [username, password])

  const loginButtonClicked = async (e) => {
    e.preventDefault()
    try {
      const token = await login({ username, password }).unwrap()
      
      const user = await getUser({ userID: token.userID }).unwrap()
      dispatch(loginSuccess({ userData: user })) // store user data
      setUsername('')
      setPassword('')
      navigate('/app')
    } catch (err) {
      if (!err.status) {
        setErrMsg('No Server Response')
      } else {
        setErrMsg(err?.data?.message)
      } 
    }
  }

  return (
    <main className='login-page'>
      <h2>Login</h2>
      <section className="component__container">
        <form className='login-page__form' onSubmit={loginButtonClicked}>
          <div className='login-page__field-container'>
            <label htmlFor="username" className='login-page__input-label component__input-label'>Username</label>
            <input 
              value={username}
              onChange={onUsernameChanged}
              type="text" 
              placeholder="Username" 
              className='login-page__input component__input'
              autoComplete='off'
              required
            />
          </div>
          <div className='login-page__field-container'>
            <label htmlFor="password" className='login-page__input-label component__input-label'>Password</label>
            <input 
              value={password}
              onChange={onPasswordChanged}
              type="password" 
              placeholder="Password" 
              className='login-page__input component__input'
              required
            />
          </div>
          <div className='login-page__field-container'>
            
          {errMsg ? <Error message={errMsg} />: ''}
            <input 
              type='submit' 
              value='Login' 
              className='login-page__button-submit component__large-button'
              required
            />
            <Link to='/register' style={{textDecoration: 'none'}}><p className='login-page__register-text'>Don't have an Account?</p></Link>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Login