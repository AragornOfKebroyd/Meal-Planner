import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Redux
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './app/store'
import { Provider } from 'react-redux'

const PERSIST = Boolean(Number(process.env.REACT_APP_PERSIST))

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {PERSIST ? 
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path='/*' element={<App />} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
       :
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </BrowserRouter>
      }
    </Provider>
  </React.StrictMode>
)