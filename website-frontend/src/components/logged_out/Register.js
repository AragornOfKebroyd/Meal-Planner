import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useGetAllUsersQuery } from '../../app/services/usersApiSlice'
import { useAddNewUserMutation } from '../../app/services/authApiSlice'
import Error from '../common/Error'

import './Login-Register.css'
import Spinner from '../common/Spinner'

const USERNAME_REGEX = /^[a-zA-Z0-9-_]{0,23}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ ]).{8,128}$/

const Register = () => {
  const [addNewUser, {isLoading: isNewUserMutationLoading, isSuccess: isNewUserMutationSuccess, isError: isNewUserMutationError, error: NewUserMutationError}] = useAddNewUserMutation()
  const navigate = useNavigate()

  // Controlled inputs
  const [username, setUsername] = useState('')
  const [validUsername, setValidUsername] = useState(false)

  const [password, setPassword] = useState('')
  const [validPassword, setValidPassword] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')
  const [validConfirmPassword, setValidConfirmPassword] = useState(false)

  const onUsernameChanged = (e) => setUsername(e.target.value)
  const onPasswordChanged = (e) => setPassword(e.target.value)
  const onConfirmPasswordChanged = (e) => setConfirmPassword(e.target.value)

  // check if values are valid
  useEffect(() => {
    const result = USERNAME_REGEX.test(username)
    setValidUsername(result)
  }, [username])

  useEffect(() => {
    const result = PASSWORD_REGEX.test(password)
    setValidPassword(result)
    const match = password === confirmPassword
    setValidConfirmPassword(match)
  }, [password, confirmPassword])

  // get usernames for validation
  const {data: users, isLoading: isGetAllUsersLoading, isSuccess: isGetAllUsersSuccess, isError: isGetAllUsersError, error: getAllUsersError} = useGetAllUsersQuery()

  let duplicateUsernameMessage
  let duplicateUsername = false

  if (isGetAllUsersError) {
    console.error(getAllUsersError)
    duplicateUsernameMessage = <Error error={getAllUsersError} />
  }

  if (isGetAllUsersSuccess) {
    const { ids, entities } = users
    const usernames = ids.map(id => entities[id].username)
    if (usernames.includes(username)) {
      duplicateUsernameMessage = <p className='register-page__instructions'>Username Is Taken.</p>
      duplicateUsername = true
    } else {
      duplicateUsernameMessage = ''
      duplicateUsername = false
    }
  }
  
  const canSave = [!isGetAllUsersLoading, !duplicateUsername, validPassword, validUsername, validConfirmPassword].every(Boolean) && !isNewUserMutationLoading

  // Submitted
  const registerButtonClicked = async (e) => {
    e.preventDefault()
    if (canSave) {
      addNewUser({ username, password })
    }
  }

  useEffect(() => {
    if (isNewUserMutationSuccess) {
      navigate('/login')
    }
  }, [isNewUserMutationSuccess])

  return (
    <main className='register-page'>
      <h2>Register</h2>
      <section className="component__container">
        <form className='register-page__form' onSubmit={registerButtonClicked}>
          <div className='register-page__field-container'>
            <label htmlFor="username" className='register-page__input-label component__input-label'>Username</label>
            <input 
              value={username}
              onChange={onUsernameChanged} 
              id="username" 
              type="text" 
              placeholder="Username" 
              className={`${username ? validUsername && !duplicateUsername  ? 'valid-input' : 'invalid-input' : ''} register-page__input component__input`}
              required
            />
            <p className='small-text'>Username will not be visible to anyone but you.</p>
            {duplicateUsernameMessage}
            <p className={username && !validUsername ? "register-page__instructions" : "hide"}>
              up to 24 characters. <br />
              Must begin with a letter <br />
              Letters, numbers, underscores and hyphens allowed.
            </p>
          </div>
          <div className='register-page__field-container'>
            <label htmlFor="password" className='register-page__input-label component__input-label'>Password</label>
            <input 
              value={password} 
              onChange={onPasswordChanged} 
              id="password"
              type="password" 
              placeholder="Password" 
              className={`${password ? validPassword ? 'valid-input' : 'invalid-input' : ''} register-page__input component__input`}
              required
            />            
            <p className={password && !validPassword ? "register-page__instructions" : "hide"}>
              8 to 128 characters. <br />
              Must include uppercase and lowercase letters, a number and a special character. <br />
              Allowed special characters:  {'!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'}
            </p>
          </div>
          <div className='register-page__field-container'>
            <label htmlFor="confirm-password" className='register-page__input-label component__input-label'>Confirm Password</label>
            <input 
              value={confirmPassword}
              onChange={onConfirmPasswordChanged}
              id="confirm-password" 
              type="password" 
              placeholder="Confirm password" 
              className={`${confirmPassword ? validConfirmPassword ? 'valid-input' : 'invalid-input' : ''} register-page__input component__input`}
              required
            />
            <p className={confirmPassword && !validConfirmPassword ? "register-page__instructions" : "hide"}>
              Must match the first password input field.
            </p>
          </div>

          <div className='register-page__field-container'>
            <button disabled={!canSave} type='submit' className='register-page__button-submit component__large-button'>Register</button>
            <Link to='/login' style={{textDecoration: 'none'}}><p className='register-page__register-text'>Allready have an Account?</p></Link>
          </div>
        </form>
        {isNewUserMutationLoading
          ? <Spinner />
          : isNewUserMutationError
            ? <Error error={NewUserMutationError} />
            : null}
      </section>
    </main>
  )
}

export default Register