import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import PostCard from "../components/PostCard"
import { motion, AnimatePresence } from "framer-motion"

export default function Feed() {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState("")

  const [sections, setSections] = useState([
    {
      title: "",
      content: "",
    },
  ])

  const [user, setUser] = useState(null)

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          username,
          avatar_url,
          role,
          xp
        ),
        post_sections (
          id,
          title,
          content,
          order_index
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setPosts(data || [])
  }

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error(error)
      return
    }

    setProfile(data)
  }

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  async function addPost() {
    if (!title.trim()) return

    const validSections = sections.filter(
      (section) =>
        section.title.trim() || section.content.trim()
    )

    if (validSections.length === 0) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    let imageUrl = null

    /*
      Upload post image
    */

    if (image) {
      const ext = image.name.split(".").pop()

      const fileName = `${user.id}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, image)

      if (uploadError) {
        console.error(uploadError)
        alert(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    /*
      Create post
    */

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        content: "",
        user_email: user.email,
        user_id: user.id,
        image_url: imageUrl,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    /*
      Create sections
    */

    const { error: sectionsError } = await supabase
      .from("post_sections")
      .insert(
        validSections.map((section, index) => ({
          post_id: post.id,
          title: section.title,
          content: section.content,
          order_index: index,
        }))
      )

    if (sectionsError) {
      console.error(sectionsError)
      alert(sectionsError.message)
      return
    }

    /*
      Reset form
    */

    setTitle("")

    setSections([
      {
        title: "",
        content: "",
      },
    ])

    setImage(null)
    setImagePreview("")

    fetchPosts()
  }

  async function deletePost(id) {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
      return
    }

    fetchPosts()
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)

    const previewUrl = URL.createObjectURL(file)

    setImagePreview(previewUrl)
  }

  function removeImage() {
    setImage(null)
    setImagePreview("")
  }

  useEffect(() => {
    fetchPosts()
    loadProfile()
    fetchUser()
  }, [])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          relative
          overflow-hidden
          rounded-[32px]
          border
          border-slate-200
          bg-white
          p-8
          md:p-10
          mb-8
          shadow-[0_20px_60px_rgba(15,23,42,.08)]
        "
      >
        <div
          className="
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-yellow-300/25
            blur-[90px]
          "
        />

        <p className="text-yellow-600 uppercase tracking-[0.28em] text-sm font-bold">
          Welcome Back
        </p>

        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-slate-950">
          {profile?.username || user?.email}
        </h1>

        <p className="mt-2 max-w-2xl text-base md:text-lg leading-7 text-slate-500">
          Inspire students. Share knowledge. Build the future.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div className="rounded-2xl bg-white px-6 py-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Posts
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              {posts.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white px-6 py-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Level
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              1
            </h2>
          </div>

          <div className="rounded-2xl bg-yellow-50 px-6 py-5 border border-yellow-200">
            <p className="text-slate-500 text-sm font-medium">
              XP
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              0
            </h2>
          </div>
        </div>
      </motion.div>

      <div
        className="
          relative
          mb-8
          overflow-hidden
          rounded-[32px]
          border
          border-slate-200
          bg-gradient-to-br
          from-white
          via-white
          to-yellow-50
          p-6
          md:p-8
          shadow-[0_16px_50px_rgba(15,23,42,.07)]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-64
            w-64
            rounded-full
            bg-yellow-200/35
            blur-[80px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            -left-20
            h-56
            w-56
            rounded-full
            bg-sky-100/50
            blur-[80px]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-4
            mb-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-yellow-600 font-bold">
              Community
            </p>

            <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-950">
              Create a new post
            </h2>
          </div>

          <div className="rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
            Public
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="
            w-full
            rounded-2xl
            border-2
            border-slate-200
            bg-white
            px-6
            py-4
            mb-6
            text-2xl
            font-bold
            text-slate-950
            placeholder:text-slate-400
            outline-none
            shadow-[0_8px_30px_rgba(15,23,42,.06)]
            transition-all
            duration-200
            focus:border-yellow-300
            focus:ring-4
            focus:ring-yellow-100
            focus:shadow-[0_10px_35px_rgba(234,179,8,.12)]
          "
        />

        <div className="mt-5 space-y-4">
          {sections.map((section, index) => (
            <div
              key={index}
              className="
                rounded-3xl
                border
                border-slate-200
                bg-gradient-to-br
                from-slate-50
                via-white
                to-amber-50/40
                p-6
                shadow-sm
              "
            >
              <input
                value={section.title}
                onChange={(e) => {
                  const copy = [...sections]

                  copy[index].title = e.target.value

                  setSections(copy)
                }}
                placeholder={`Section ${index + 1} title`}
                className="
                  w-full
                  bg-transparent
                  text-xl
                  font-bold
                  outline-none
                  mb-4
                  text-slate-950
                  placeholder:text-slate-400
                "
              />

              <textarea
                value={section.content}
                onChange={(e) => {
                  const copy = [...sections]

                  copy[index].content = e.target.value

                  setSections(copy)
                }}
                rows={5}
                placeholder="Write section..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3
                  outline-none
                  text-[15px]
                  leading-7
                  text-slate-800
                  font-bold
                  placeholder:text-slate-400
                  transition
                  focus:border-yellow-300
                  focus:bg-white
                  focus:ring-4
                  focus:ring-yellow-100
                "
              />
            </div>
          ))}
        </div>

        {/* IMAGE */}

        <div className="mt-6">
          <label
            className="
              inline-flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-yellow-300
              bg-yellow-50
              px-5
              py-3
              font-semibold
              text-yellow-700
              transition
              hover:-translate-y-0.5
              hover:bg-yellow-100
            "
          >
            📷 Add photo

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>

          {imagePreview && (
            <div
              className="
                relative
                mt-4
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-slate-100
              "
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="
                  max-h-[450px]
                  w-full
                  object-cover
                "
              />

              <button
                type="button"
                onClick={removeImage}
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  bg-black/70
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-black/90
                "
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() =>
            setSections([
              ...sections,
              {
                title: "",
                content: "",
              },
            ])
          }
          className="
            mt-6
            rounded-xl
            border
            border-yellow-300
            bg-yellow-50
            px-5
            py-3
            font-semibold
            text-yellow-700
            transition
            hover:-translate-y-0.5
            hover:bg-yellow-100
          "
        >
          + Add section
        </button>

        <motion.button
          disabled={!title.trim()}
          whileHover={{ y: -2 }}
          whileTap={{ y: 1 }}
          onClick={addPost}
          className="
            mt-6
            rounded-2xl
            bg-gradient-to-r
            from-yellow-400
            to-amber-400
            px-10
            py-3.5
            font-bold
            text-amber-950
            transition-all
            duration-300
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          Publish
        </motion.button>
      </div>

      <motion.div
        layout
        className="mt-5 space-y-4 pb-20"
      >
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              deletePost={deletePost}
              user={user}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  )
}