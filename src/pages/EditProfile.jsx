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

    if (!user) {
      navigate("/login")
      return
    }

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

    if (!user) return

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

    if (!user) {
      setSaving(false)
      return
    }

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
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-slate-500">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl pb-20"
    >
      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-yellow-500">
          Account
        </p>

        <h1 className="mt-2 text-5xl font-black text-slate-900">
          Edit Profile
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          Customize your profile and personal information.
        </p>
      </div>

      {/* CARD */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
        }}
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-slate-200
          bg-white
          shadow-[0_30px_100px_rgba(15,23,42,.10)]
        "
      >
        {/* decorative background */}

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/20 blur-[100px]" />

        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-violet-300/15 blur-[110px]" />

        {/* TOP BANNER */}

        <div className="relative h-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-amber-100 to-sky-100" />

          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-yellow-300/30 blur-[70px]" />

          <div className="absolute -left-10 -bottom-32 h-64 w-64 rounded-full bg-violet-300/20 blur-[70px]" />
        </div>

        <div className="relative px-8 pb-10 md:px-12">
          {/* AVATAR */}

          <div className="-mt-16 flex flex-col items-center">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="
                  h-36
                  w-36
                  overflow-hidden
                  rounded-full
                  border-4
                  border-white
                  bg-gradient-to-br
                  from-yellow-400
                  to-amber-500
                  shadow-[0_15px_40px_rgba(15,23,42,.15)]
                "
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white">
                    {username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </motion.div>

              <label
                className="
                  absolute
                  bottom-1
                  right-1
                  flex
                  h-11
                  w-11
                  cursor-pointer
                  items-center
                  justify-center
                  rounded-full
                  border-4
                  border-white
                  bg-yellow-400
                  text-xl
                  text-black
                  shadow-lg
                  transition
                  hover:scale-110
                "
                title="Change avatar"
              >
                +
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    uploadAvatar(e.target.files?.[0])
                  }}
                />
              </label>
            </div>

            <h2 className="mt-6 text-3xl font-black text-slate-900">
              {username || "Your Profile"}
            </h2>

            <p className="mt-1 text-slate-400">
              Update your personal information
            </p>
          </div>

          {/* FORM */}

          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-500">
                Username
              </p>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-5
                  py-4
                  text-slate-900
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-slate-400
                  focus:border-yellow-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-yellow-400/10
                "
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  Bio
                </p>

                <span className="text-xs text-slate-400">
                  {bio.length}/300
                </span>
              </div>

              <textarea
                rows={5}
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself..."
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-5
                  py-4
                  text-slate-900
                  outline-none
                  transition-all
                  duration-300
                  placeholder:text-slate-400
                  focus:border-yellow-400
                  focus:bg-white
                  focus:ring-4
                  focus:ring-yellow-400/10
                "
              />
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(-1)}
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-7
                  py-4
                  font-bold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                "
              >
                Cancel
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={save}
                disabled={saving}
                className="
                  rounded-2xl
                  bg-gradient-to-r
                  from-yellow-400
                  to-amber-500
                  px-8
                  py-4
                  font-black
                  text-black
                  shadow-[0_15px_35px_rgba(250,204,21,.25)]
                  transition
                  hover:shadow-[0_18px_45px_rgba(250,204,21,.35)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}