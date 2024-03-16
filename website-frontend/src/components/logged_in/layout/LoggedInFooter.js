import { useSelector } from "react-redux"
import { selectCurrentUser } from "../../../app/state/authSlice"

const LoggedInFooter = () => {
  const userData = useSelector(selectCurrentUser)

  let username = '[Not Logged In]'
  if (Object.keys(userData).length) {
    username = userData.username
  }

  return (
    <footer className='logged-in-footer'>
      <p className="logged-in-footer__username">User: {username}</p>
    </footer>
  )
}

export default LoggedInFooter