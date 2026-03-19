import { Routes, Route, Navigate } from "react-router"
import { Home } from "./pages/Home"
import { Chat } from "./pages/Chat"
import { useAuth } from "@clerk/react"
import { PageLoader } from "./components/PageLoader"
import { useUserSync } from "./hooks/useUserSync.js"

function App() {
  const { isLoaded , isSignedIn} = useAuth()

  useUserSync()

  if (!isLoaded) {
    return <PageLoader />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={ !isSignedIn ? <Home /> : <Navigate to='/chat' />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path='/chat' element={ isSignedIn ? <Chat /> : <Navigate to='/home' />} />
      </Routes>
    </>
  )
}

export default App