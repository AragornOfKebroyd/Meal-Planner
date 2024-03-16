import './LoggedInLayout.css'

import { Outlet } from 'react-router-dom'
import LoggedInHeader from './LoggedInHeader'
import LoggedInFooter from './LoggedInFooter'
import LoggedInNav from './LoggedInNav'

const LoggedInLayout = () => {
  return (
    <>
      <LoggedInHeader />
      <div className='nav-and-content'>
        <LoggedInNav />
        <div className='nav-and-content__main'>
          <Outlet />
        </div>
      </div>
      <LoggedInFooter />
    </>
  )
}

export default LoggedInLayout