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
          rounded-[36px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#171A22]
          via-[#12141B]
          to-[#0B0C10]
          p-10
          mb-10
          shadow-[0_40px_120px_rgba(0,0,0,.45)]
        "
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

        <p className="text-yellow-400 uppercase tracking-[0.35em] text-sm">
          Welcome Back
        </p>

        <h1 className="mt-3 text-6xl font-black">
          {profile?.username || user?.email}
        </h1>

        <p className="mt-3 text-slate-400 text-lg">
          Inspire students. Share knowledge. Build the future.
        </p>

        <div className="mt-8 flex gap-5">
          <div className="rounded-2xl bg-white/5 px-6 py-5">
            <p className="text-slate-400 text-sm">Posts</p>
            <h2 className="text-3xl font-black">{posts.length}</h2>
          </div>

          <div className="rounded-2xl bg-white/5 px-6 py-5">
            <p className="text-slate-400 text-sm">Level</p>
            <h2 className="text-3xl font-black">1</h2>
          </div>

          <div className="rounded-2xl bg-white/5 px-6 py-5">
            <p className="text-slate-400 text-sm">XP</p>
            <h2 className="text-3xl font-black">0</h2>
          </div>
        </div>
      </motion.div>

      <div
        className="
          mb-10
          rounded-[34px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#16181F]
          to-[#0D0F13]
          p-8
          shadow-[0_30px_90px_rgba(0,0,0,.55)]
        "
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-400">
              Community
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Create a new post
            </h2>
          </div>

          <div className="rounded-xl bg-yellow-500/10 px-4 py-2 text-yellow-400">
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

<div className="space-y-6">
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

      <motion.div layout className="space-y-6 pb-20">
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