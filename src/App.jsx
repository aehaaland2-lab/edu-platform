import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import Profile from "./pages/Profile"
import EditProfile from "./pages/EditProfile"
import TestEditor from "./pages/TestEditor"
import PlayTest from "./pages/PlayTest"
import { supabase } from "./supabase"
import CompleteProfile from "./pages/CompleteProfile"

import Layout from "./components/Layout"

import Auth from "./pages/Auth"
import Feed from "./pages/Feed"
import Tests from "./pages/Tests"
import Leaderboard from "./pages/Leaderboard"

function Messages() {
  return <h1 className="text-white text-2xl">Messages</h1>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [profileExists, setProfileExists] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = async () => {
    await supabase.auth.signOut()
  }
  async function checkProfile(user) {
  if (!user) {
    setProfileExists(null)
    return
  }

  const { data, error } = await supabase
  .from("profiles")
  .select("id")
  .eq("id", user.id)
  .maybeSingle()

if (error) {
  console.error(error)
  setProfileExists(false)
  return
}

setProfileExists(!!data)
}

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null

setUser(currentUser)
checkProfile(currentUser)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null

setUser(currentUser)
checkProfile(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
  return null
}

  return (
    <>

      <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/test/editor/:id" element={<TestEditor />} />
      <Route path="/test/play/:id" element={<PlayTest />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route
        path="/*"
        element={
          user ? (
  profileExists ? (
    <Layout user={user} logout={logout}>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  ) : (
    <Navigate to="/complete-profile" replace />
  )
) : (
  <Navigate to="/auth" replace />
)
        }
      />
    </Routes>
    </>
  )
}