import { Routes, Route } from 'react-router-dom'
import LoggedOutLayout from './components/logged_out/layout/LoggedOutLayout'
import Info from './components/logged_out/Info'
import Login from './components/logged_out/Login'
import Register from './components/logged_out/Register'

import LoggedInLayout from './components/logged_in/layout/LoggedInLayout'
import Home from './components/logged_in/Home'

import MealPlanLibrary from './components/logged_in/meal_plans/MealPlanLibrary'
import CreateMealPlan from './components/logged_in/meal_plans/CreateMealPlan'
import EditMealPlan from './components/logged_in/meal_plans/EditMealPlan'
import SelectMealPlan from './components/logged_in/meal_plans/SelectMealPlan'
import ViewMealPlan from './components/logged_in/meal_plans/ViewMealPlan'

import SavedRecipeLibrary from './components/logged_in/recipes/SavedRecipeLibrary'
import CreateRecipe from './components/logged_in/recipes/CreateRecipe'
import EditRecipe from './components/logged_in/recipes/EditRecipe'
import SelectRecipe from './components/logged_in/recipes/SelectRecipe'
import ViewRecipe from './components/logged_in/recipes/ViewRecipe'

import SearchRecipes from './components/logged_in/recipes/SearchRecipes'

import Cupboard from './components/logged_in/Cupboard'

import ShoppingList from './components/logged_in/meal_plans/ShoppingList'

import Settings from './components/logged_in/Settings'

import PageNotFound from './components/PageNotFound'

import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path='*' element={<PageNotFound/>} />
      <Route path='/' element={<LoggedOutLayout />}>
        <Route index element={<Info />} />
        <Route path='login' element={<Login />}/>
        <Route path='register' element={<Register />}/>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path='/app' element={<LoggedInLayout />}>
          <Route index element={<Home />} />

          <Route path='meal-plans'>
            <Route index element={<MealPlanLibrary />} />
            <Route path=':meal_planID'>
              <Route index element={<ViewMealPlan />} />
              <Route path='edit' element={<EditMealPlan />} />
            </Route>

            <Route path='select' element={<SelectMealPlan />} />
            <Route path='create' element={<CreateMealPlan />} />
          </Route>

          <Route path='recipes'>
            <Route index element={<SavedRecipeLibrary />} />
            <Route path=':recipeID'>
              <Route index element={<ViewRecipe />} />
              <Route path='edit' element={<EditRecipe />} />
            </Route>

            <Route path='select' element={<SelectRecipe />} />
            <Route path='create' element={<CreateRecipe />} />
          </Route>

          <Route path='search' element={<SearchRecipes />}/>

          <Route path='cupboard' element={<Cupboard />}/>

          <Route path='shopping-list'>
            <Route index element={<ShoppingList active={true}/>} />
            <Route path=':meal_planID' element={<ShoppingList />} />
          </Route>
          
          <Route path='settings' element={<Settings />}/>
        </Route>
      </Route>
    </Routes>
  )
}

export default App;