import './Settings.css'

// For object equality checking
import _ from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faRefresh } from '@fortawesome/free-solid-svg-icons'

import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'

import { useGetAllUsersQuery, useUpdateUserDataMutation } from '../../app/services/usersApiSlice';
import { useSearchRecipesMutation } from '../../app/services/recipesApiSlice'
import { selectCurrentUser, updateSettings } from '../../app/state/authSlice'
import { prepRecipeOptionsSettings, prepIngredientOptionsSettings } from '../../functionality/prepSearchOptions';

import ExcludedIngredients from '../common/blocks/ExcludedIngredients';

import Modal from '../common/Modal'
import NutritionalValues from '../common/blocks/NutritionalValues';
import DietaryPreferences from '../common/blocks/DietaryPreferences';
import Spinner from '../common/Spinner';
import Error from '../common/Error';
import { useChangePasswordMutation } from '../../app/services/authApiSlice';

const NO_IMAGE = 'https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6-300x188.png'
const DEFAULT_IMAGE = process.env.REACT_APP_DEFAULT_IMAGE

const useImage = Boolean(Number(process.env.REACT_APP_USE_IMAGES))

const USERNAME_REGEX = /^[a-zA-Z0-9-_]{0,23}$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ ]).{8,128}$/

const Settings = () => {
  const dispatch = useDispatch()
  const [getPercentageRecipes, {data: percentageRecipesData, isLoading: isPercentageRecipesLoading, isSuccess: isPercentageRecipesSuccess}] = useSearchRecipesMutation()

  const userID = useSelector(selectCurrentUser).userID 

  const userData = useSelector((state) => state.auth.userData)
  const [currentData, setCurrentData] = useState(userData)
  const setCurrentUserData = (args) => setCurrentData({...currentData, 'user': {...currentData.user, ...args}})
  const [modalContent, setModalContent] = useState()
  const [showModal, setShowModal] = useState(false)
  const [updateUserData, { data: updateUserDataData, isSuccess: isUpdateUserDataSuccess }] = useUpdateUserDataMutation()

  useEffect(() => {
    if (isUpdateUserDataSuccess) {
      const newData = updateUserDataData.user
      dispatch(updateSettings({ userData: newData }))
      setCurrentData(newData)
    }
  }, [isUpdateUserDataSuccess])

  const discardButtonClicked = (e) => {
    e.preventDefault()
    setCurrentData(userData)
  }
  
  // Account
  const [editingUsername, setEditingUsername] = useState(false)
  const [tempUrl, setTempUrl] = useState('')
  
  const editUsernameClicked = (e) => {
    setEditingUsername(true)
  }

  // Username
  const {data: users, isSuccess: isGetAllUsersSuccess} = useGetAllUsersQuery()
  const [duplicateName, setDuplicateName] = useState(false)
  const [usernames, setUsernames] = useState([])

  useEffect(() => {
    if (isGetAllUsersSuccess) {
      const { ids, entities } = users
      const names = ids.map(id => entities[id].username)
      setUsernames(names)
    }
  }, [isGetAllUsersSuccess])
  
  const usernameUpdated = (e) => {
    if (usernames.length === 0) return
    if (usernames.includes(e.target.value) && (e.target.value !== userData.user.username)) {
      setDuplicateName(true)
    } else {
      setDuplicateName(false)
    }
    if (editingUsername) {
      setCurrentUserData({ username: e.target.value })
    }
  }

  const setUrlWithinModalClicked = (e) => {
    e.preventDefault()
    setCurrentUserData({ profile_url: tempUrl })
    setShowModal(false)
    setTempUrl('')
  }

  const changePfpClicked = (e) => {
    e.preventDefault()
    setModalContent('url')
    setShowModal(true)
  }

  const changePasswordClicked = (e) => {
    e.preventDefault()
    setModalContent('password')
    setShowModal(true)
  }

  // Password
  const [prevpassword, setPrevpassword] = useState('')
  const [newpassword, setNewpassword] = useState('')
  const [validNewPassword, setValidNewPassword] = useState(false)

  const prevpasswordUpdated = (e) => setPrevpassword(e.target.value)
  const newPasswordUpdated = (e) => setNewpassword(e.target.value)

  const [changePassword, {isSuccess: isChangePasswordSuccess, isError: isChangePasswordError, error: changePasswordError}] = useChangePasswordMutation()

  const updatePasswordWithinModalClicked = (e) => {
    e.preventDefault()
    changePassword({userID: userID, password: prevpassword, newPassword: newpassword})
  }

  useEffect(() => {
    if (isChangePasswordSuccess) {
      setShowModal(false)
      setPrevpassword('')
      setNewpassword('')
    }
  }, [isChangePasswordSuccess])

  useEffect(() => {
    const result = PASSWORD_REGEX.test(newpassword)
    setValidNewPassword(result)
  }, [prevpassword, newpassword])


  // Other
  const imageUrl = currentData.user.profile_url || NO_IMAGE

  const refreshPercentage = () => {
    const recipeOptions = prepRecipeOptionsSettings(currentData)
    const ingredientOptions = prepIngredientOptionsSettings(currentData)
    getPercentageRecipes({ recipeOptions, ingredientOptions, 'countOnly': true })
  }

  useEffect(() => {
    refreshPercentage()
  }, [])

  
  const saveButtonClicked = (e) => {
    e.preventDefault()
    refreshPercentage()
    updateUserData(currentData)
  }

  return (
    <main className='settings-page'>
      {/* MODAL */}
      <Modal show={showModal} setShow={setShowModal}>
        {modalContent === 'url' &&
        <form className='modal__form'>
          <h2 className='modal_padding'>Set a new url:</h2>
          <input id='url' type='text' placeholder='https://...' value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} className='component__input modal_padding'></input>
          <button type='submit' className='component__small-button component__button-colour-orange' onClick={setUrlWithinModalClicked}>Set</button>
        </form>
        }
        {modalContent === 'password' &&
        <form className='modal__form'>
          <h2 className='modal_padding'>Previous Password</h2>
          <input id='prev-password' type='password' placeholder='previous password' value={prevpassword} onChange={prevpasswordUpdated} className='component__input'></input>
          <h2 className='modal_padding'>New Password</h2>
          <input id='new-password' type='password' placeholder='new password' value={newpassword} onChange={newPasswordUpdated} className={`${newpassword ? validNewPassword ? 'valid-input' : 'invalid-input' : ''} component__input`}></input>
          <p className={newpassword && !validNewPassword ? "register-page__instructions" : "hide"}>
              8 to 128 characters. <br />
              Must include uppercase and lowercase letters, a number and a special character. <br />
              Allowed special characters:  {'!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'}
          </p>
          {isChangePasswordError && <Error error={changePasswordError}/>}
          <button type='submit' className='component__small-button component__button-colour-orange' onClick={updatePasswordWithinModalClicked} disabled={!validNewPassword}>Set</button>
        </form>
        }
      </Modal>
      {/* PAGE */}
      <h2>Settings</h2>

      {/* Account Section */}
      <h3>Account</h3>
      <form className='settings__form'>
        <section className='component__container__wide'>
          <div className='user-info-grid'>
            <div className='settings__pfp-container'>
              <img className='settings__pfp' alt='profile ' src={useImage ? imageUrl : DEFAULT_IMAGE} onError={(e)=>{
                e.target.onError = null
                e.target.src = NO_IMAGE
              }}/>
            </div>
            <div className='user-info-grid__username'>
              <label htmlFor='username' className='component__input-label'>Username</label>
              <div className='user-info-grid__username__editable'>
                <input id='username' type='text' value={currentData.user.username} onChange={usernameUpdated} onBlur={(e) => setEditingUsername(false)} disabled={!editingUsername} className='component__input settings__account__username-input'/>
                <FontAwesomeIcon icon={faPenToSquare} onClick={editUsernameClicked} className='edit-username-icon'/>
              </div>
              {duplicateName && <p className='register-page__instructions'>Username Is Taken.</p>}
            </div>
            <button className='component__small-button settings__small-button component__button-colour-orange settings__account__button' onClick={changePfpClicked} type="button">Change Icon</button>
            <button className='component__small-button settings__small-button component__button-colour-orange settings__account__button' onClick={changePasswordClicked} type="button">Change Password</button>          
          </div>
        </section>
        {!_.isEqual(userData, currentData) ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}

        {/* Preferences Section */}
        <h3>Preferences</h3>
        <section className='component__container__wide'>
          
          {/* Will not impliment dietary preferences as i cant figure out a way to do it well */}
          {/* <h4>Dietery Preference</h4>
          <DietaryPreferences ingredientData={currentData} setIngredientData={setCurrentData} /> */} 
          
          <h4>Excluded Ingredients*</h4>
          <ExcludedIngredients ingredientData={currentData} setIngredientData={setCurrentData} />
          
          <h4>Nutritional Values**</h4>
          <NutritionalValues ingredientData={currentData} setIngredientData={setCurrentData} />
          <p className='subscript-note percent-blow-subscript'>**Some of these settings will remove a large proportion of the available recipes, % of recipes left shown below</p>
          
          
          <div className='settings__recipes-left'>
            <p>Due to your settings you have <span className='settings__recipes-left__perc'>{
              isPercentageRecipesSuccess 
                ? Math.round(percentageRecipesData.percentage * 100) / 100
                : isPercentageRecipesLoading && <Spinner size='30px' />
            }%<FontAwesomeIcon icon={faRefresh} onClick={refreshPercentage}  style={{fontSize:'20px'}}/></span> of recipes available.</p>
            <p>({isPercentageRecipesSuccess && percentageRecipesData.total})</p>
          </div>
        </section>
        {!_.isEqual(userData, currentData) ? <p className='unsaved-changes'>*Unsaved Changes</p> : ''}
        
        {/* Button Row */}
        <div className='component__button-row'>
          <button onClick={saveButtonClicked} className='component__large-button component__button-colour-save' disabled={duplicateName || _.isEqual(userData, currentData)}>Save</button>
          <button onClick={discardButtonClicked} className='component__large-button component__button-colour-discard' disabled={_.isEqual(userData, currentData)}>Discard</button>
        </div>
      </form>
    </main>
  )
}

export default Settings