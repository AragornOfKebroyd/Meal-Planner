import { Link } from "react-router-dom"

const LoggedInNav = () => {
  return (
    <nav className="nav-and-content__nav">
      <Link to='/app' className="nav-item" style={{marginTop:0}}>Home</Link>
      <Link to='/app/meal-plans' className="nav-item">Meal Plans</Link>
      <Link to='/app/recipes' className="nav-item">Recipe Library</Link>
      <Link to='/app/search' className="nav-item">Search</Link>
      <Link to='/app/cupboard' className="nav-item">Cupboard</Link>
      <Link to='/app/shopping-list' className="nav-item">Shopping List</Link>
      <Link to='/app/settings' className="nav-item nav-item__settings">Settings</Link>
    </nav>
  )
}

export default LoggedInNav