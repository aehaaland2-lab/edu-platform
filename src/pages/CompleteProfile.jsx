import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../supabase"

export default function CompleteProfile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/auth")
        return
      }

      setUser(user)

      const defaultName =
        user.user_metadata?.preferred_username ||
        user.user_metadata?.name ||
        ""

      setUsername(
        defaultName.toLowerCase().replace(/\s+/g, "")
      )
    }

    load()
  }, [navigate])

  async function finish() {
    if (!username.trim()) {
      alert("Введите ник")
      return
    }

    setLoading(true)

    const { data: exists } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (exists) {
      alert("Этот ник уже занят")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username,
        bio,
        role: "student",
        xp: 0,
        avatar_url: user.user_metadata?.avatar_url,
      })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    window.location.href = "/"
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-white">
      <div className="w-[430px] rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-8">

        <img
          src={user.user_metadata?.avatar_url}
          className="w-28 h-28 rounded-full mx-auto"
        />

        <h1 className="text-3xl font-bold text-center mt-5">
          Finish Registration
        </h1>

        <p className="text-center text-slate-400 mt-2">
          Choose your username
        </p>

        <input
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          placeholder="Username"
          className="w-full mt-8 rounded-xl bg-black/30 border border-white/10 p-4"
        />

        <textarea
          value={bio}
          onChange={(e)=>setBio(e.target.value)}
          placeholder="About you (optional)"
          className="w-full mt-4 rounded-xl bg-black/30 border border-white/10 p-4"
        />

        <button
          onClick={finish}
          disabled={loading}
          className="w-full mt-6 rounded-xl bg-yellow-400 py-4 text-black font-bold"
        >
          {loading ? "Saving..." : "Finish"}
        </button>

      </div>
    </div>
  )
}