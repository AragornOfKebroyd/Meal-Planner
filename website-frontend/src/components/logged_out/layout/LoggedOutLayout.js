import './LoggedOutLayout.css'

import { Outlet } from 'react-router-dom'
import LoggedOutHeader from './LoggedOutHeader'
import LoggedOutFooter from './LoggedOutFooter'

const LoggedOutLayout = () => {
  return (
    <>
      <LoggedOutHeader />
      <div className='spacing'>
        <Outlet />
      </div>
      <LoggedOutFooter />
    </>
  )
}

export default LoggedOutLayout