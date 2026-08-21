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

  async function fetchPosts() {
    const { data } = await supabase
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

    setPosts(data || [])
  }
  async function loadProfile() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

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

    const { data: post, error } = await supabase
  .from("posts")
  .insert({
    title,
    content: "",
    user_email: user.email,
    user_id: user.id,
  })
  .select()
  .single()

if (error) {
  console.error(error)
  return
}

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
  return
}

    setTitle("")

setSections([
  {
    title: "",
    content: "",
  },
])
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
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/25 blur-[90px]" />

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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-slate-500 text-sm font-medium">Posts</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">{posts.length}</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-slate-500 text-sm font-medium">Level</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">1</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-slate-500 text-sm font-medium">XP</p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">0</h2>
          </div>
        </div>
      </motion.div>

      <div
        className="
          mb-8
          rounded-[32px]
          border
          border-slate-200
          bg-white
          p-6
          md:p-8
          shadow-[0_16px_50px_rgba(15,23,42,.07)]
        "
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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
    border
    border-white/10
    bg-[#0F1117]
    px-6
    py-4
    mb-6
    text-2xl
    font-bold
    outline-none
    focus:border-yellow-400
  "
/>

<div className="mt-5 space-y-4">
  {sections.map((section, index) => (
    <div
      key={index}
      className="
        rounded-3xl
        border
        border-white/10
        bg-[#0F1117]
        p-6
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
          bg-transparent
          outline-none
          text-slate-300
        "
      />
    </div>
  ))}
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
    border-yellow-500/30
    px-5
    py-3
    text-yellow-400
    transition
    hover:bg-yellow-500/10
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
            from-yellow-500
            to-amber-400
            px-10
            py-3.5
            font-bold
            text-black
            transition-all
            duration-300
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          Publish
        </motion.button>
      </div>

      <motion.div layout className="mt-5 space-y-4 pb-20">
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