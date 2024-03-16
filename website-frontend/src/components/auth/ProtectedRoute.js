import { useSelector } from "react-redux"
import { selectUserLoggedIn } from "../../app/state/authSlice"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  const loggedIn = useSelector(selectUserLoggedIn)

  if (!loggedIn){
    return <Navigate to='/login' replace />
  }

  return <Outlet />
}

export default ProtectedRoute