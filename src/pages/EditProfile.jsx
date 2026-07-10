import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function EditProfile() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [preview, setPreview] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error(error)
      return
    }

    setUsername(data.username || "")
    setBio(data.bio || "")
    setAvatarUrl(data.avatar_url || "")
    setPreview(data.avatar_url || "")

    setLoading(false)
  }

  async function uploadAvatar(file) {
    if (!file) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const ext = file.name.split(".").pop()

    const fileName =
      user.id +
      "-" +
      Date.now() +
      "." +
      ext

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        upsert: true,
      })

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

    setAvatarUrl(data.publicUrl)
    setPreview(data.publicUrl)
  }

  async function save() {
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        bio,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    navigate("/profile/" + user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  return (
        <div className="min-h-screen bg-[#09090B] text-white flex items-center justify-center overflow-hidden relative">

      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          top-[-250px]
          left-[-200px]
          h-[550px]
          w-[550px]
          rounded-full
          bg-yellow-400/10
          blur-[170px]
        "
      />

      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, -35, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          bottom-[-220px]
          right-[-180px]
          h-[520px]
          w-[520px]
          rounded-full
          bg-violet-600/10
          blur-[180px]
        "
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: .97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: .45,
        }}
        className="
          relative
          w-[700px]
          rounded-[36px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          overflow-hidden
          shadow-[0_40px_120px_rgba(0,0,0,.45)]
        "
      >

        <div className="h-36 bg-gradient-to-r from-yellow-500/20 via-amber-400/10 to-violet-600/20"/>

        <div className="px-10 pb-10">

          <div className="-mt-16 flex flex-col items-center">

            <div className="relative">

              <div className="h-36 w-36 rounded-full overflow-hidden ring-4 ring-[#09090B] bg-[#151515]">

                {preview ? (

                  <img
                    src={preview}
                    className="h-full w-full object-cover"
                    alt=""
                  />

                ) : (

                  <div className="h-full w-full flex items-center justify-center text-6xl">
                    👤
                  </div>

                )}

              </div>

              <label
                className="
                absolute
                bottom-2
                right-2
                cursor-pointer
                rounded-full
                bg-yellow-400
                p-3
                text-black
                shadow-xl
                hover:scale-110
                transition
                "
              >
                📷

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e)=>{
                    uploadAvatar(e.target.files?.[0])
                  }}
                />

              </label>

            </div>

            <h1 className="mt-6 text-4xl font-black">
              Edit Profile
            </h1>

            <p className="mt-2 text-slate-400">
              Customize your account.
            </p>

            <div className="mt-10 w-full space-y-5">
                          <div>

                <p className="mb-2 text-sm text-slate-400">
                  Username
                </p>

                <input
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  placeholder="Username"
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/30
                  px-5
                  py-4
                  outline-none
                  transition-all
                  duration-300
                  focus:border-yellow-400
                  "
                />

              </div>

              <div>

                <p className="mb-2 text-sm text-slate-400">
                  Bio
                </p>

                <textarea
                  rows={5}
                  value={bio}
                  onChange={(e)=>setBio(e.target.value)}
                  placeholder="Tell something about yourself..."
                  className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/30
                  px-5
                  py-4
                  resize-none
                  outline-none
                  transition-all
                  duration-300
                  focus:border-yellow-400
                  "
                />

              </div>

              <motion.button

                whileHover={{
                  scale:1.02,
                }}

                whileTap={{
                  scale:.98,
                }}

                onClick={save}

                disabled={saving}

                className="
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-yellow-400
                to-amber-500
                py-4
                font-bold
                text-black
                shadow-[0_15px_40px_rgba(250,204,21,.25)]
                disabled:opacity-60
                "
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </motion.button>

            </div>

          </div>

        </div>

      </motion.div>

    </div>

  )

}