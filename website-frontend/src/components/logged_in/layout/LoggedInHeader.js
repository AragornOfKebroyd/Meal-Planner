import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { logoutSuccess as authLogout, selectCurrentUser } from "../../../app/state/authSlice"
import { logoutSuccess as recipeLogout } from "../../../app/state/recipeDataSlice"
import { logoutSuccess as userLogout } from "../../../app/state/userDataSlice"
import { useLogoutMutation } from "../../../app/services/authApiSlice"

// because of a race condition, very janky, if i can fix i will [TODO]
const delay = ms => new Promise(res => setTimeout(res, ms));

const LoggedInHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()

  const loggedInUserID = useSelector(selectCurrentUser).userID

  const logoutButtonClicked = async (e) => {
    e.preventDefault()

    try{
      await logout({ userID: loggedInUserID }).unwrap()

      navigate('/')

      await delay(50);
      
      dispatch(authLogout())
      // dispatch(recipeLogout()) maybe this one can stay
      dispatch(userLogout())
    } catch(error) {
      console.error(error)
    }    
  }

  return (
    <header className="logged-in-header">
      <div className='logged-in-header__wrapper'>
        <Link to='/app' style={{ textDecoration: 'none' }}><h1 className='logged-in-header__main-text'>Meal Planner</h1></Link>
        <Link to='/app' style={{ textDecoration: 'none' }}><img src="/icons/meal.svg" alt="meal" className='logged-in-header__icon'/></Link>
        {/* back button */}
        {/* <Link to='..' style={{ textDecoration: 'none' }}><img src="/icons/reply.svg" alt="meal" className='logged-in-header__icon-small'/></Link>  */}
      </div>
      <div className='logged-in-header__right'>
        <button onClick={logoutButtonClicked} className='logged-in-header__right__button component__large-button component__button-colour-blue' >Logout</button>
      </div>
    </header>
  )
}

export default LoggedInHeader