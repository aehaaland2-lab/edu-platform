import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
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
    <div className="
      relative
      min-h-screen
      overflow-hidden
      flex
      items-center
      justify-center
      bg-[#F4F7FA]
      px-4
      text-slate-900
    ">

      {/* Background atmosphere */}
      <motion.div
        animate={{
          x: [0, 35, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -left-40
          -top-40
          h-[520px]
          w-[520px]
          rounded-full
          bg-yellow-300/20
          blur-[170px]
        "
      />

      <motion.div
        animate={{
          x: [0, -35, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          -right-40
          -bottom-40
          h-[520px]
          w-[520px]
          rounded-full
          bg-sky-200/25
          blur-[170px]
        "
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 25,
          scale: 0.96,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[34px]
          border
          border-slate-200
          bg-white
          p-9
          shadow-[0_30px_80px_rgba(15,23,42,0.10)]
        "
      >

        {/* Yellow accent */}
        <div className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-yellow-300/20
          blur-[80px]
        />

        <div className="relative">

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="
              relative
              h-28
              w-28
              overflow-hidden
              rounded-full
              border-4
              border-white
              shadow-[0_10px_30px_rgba(15,23,42,0.12)]
              ring-4
              ring-yellow-100
            ">
              <img
                src={user.user_metadata?.avatar_url}
                className="h-full w-full object-cover"
                alt="Profile"
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="
            mt-6
            text-center
            text-3xl
            font-black
            tracking-tight
          ">
            Finish Registration
            <span className="text-yellow-500">.</span>
          </h1>

          <p className="
            mt-2
            text-center
            text-slate-500
          ">
            Create your learning profile
          </p>

          {/* Username */}
          <div className="mt-8">
            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            ">
              Username
            </label>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                text-slate-900
                outline-none
                transition-all
                duration-300
                placeholder:text-slate-400
                focus:border-yellow-400
                focus:bg-white
                focus:ring-4
                focus:ring-yellow-100
              "
            />
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-700
            ">
              About you
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={4}
              className="
                w-full
                resize-none
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
                text-slate-900
                outline-none
                transition-all
                duration-300
                placeholder:text-slate-400
                focus:border-yellow-400
                focus:bg-white
                focus:ring-4
                focus:ring-yellow-100
              "
            />
          </div>

          {/* Finish */}
          <motion.button
            whileHover={{
              y: -2,
              scale: 1.01,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={finish}
            disabled={loading}
            className="
              mt-6
              w-full
              rounded-2xl
              bg-yellow-400
              py-4
              font-bold
              text-slate-900
              shadow-[0_10px_30px_rgba(234,179,8,0.20)]
              transition-all
              duration-300
              hover:bg-yellow-300
              hover:shadow-[0_14px_35px_rgba(234,179,8,0.28)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Saving..." : "Finish Registration"}
          </motion.button>

          <p className="
            mt-5
            text-center
            text-xs
            text-slate-400
          ">
            Your profile will be used across the EDU community.
          </p>

        </div>
      </motion.div>
    </div>
  )
}