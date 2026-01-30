import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import SignIn from "./signin"
import SignUp from "./signup"
import Home from "./home"
import Admin from "./admin"
import Cart from "./cart"

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
