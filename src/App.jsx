import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import TestEditor from "./pages/TestEditor"
import PlayTest from "./pages/PlayTest"
import { supabase } from "./supabase"

import Layout from "./components/Layout"

import Auth from "./pages/Auth"
import Feed from "./pages/Feed"
import Tests from "./pages/Tests"
import LoadingScreen from "./components/LoadingScreen"

function Messages() {
  return <h1 className="text-white text-2xl">Messages</h1>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)

  const logout = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setLoading(false)
      setTimeout(() => {
        setShowLoader(false)
      }, 2500)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return showLoader ? <LoadingScreen /> : null
  }

  return (
    <>
      {showLoader && <LoadingScreen />}

      <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/test/editor/:id" element={<TestEditor />} />
      <Route path="/test/play/:id" element={<PlayTest />} />
      <Route
        path="/*"
        element={
          user ? (
            <Layout user={user} logout={logout}>
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/tests" element={<Tests />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
    </>
  )
}