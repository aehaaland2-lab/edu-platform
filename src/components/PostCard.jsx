import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import CommentSection from "./CommentSection"

export default function PostCard({ post, deletePost, user }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [openedSections, setOpenedSections] = useState({})

  useEffect(() => {
    fetchLikes()
  }, [])

  async function fetchLikes() {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", post.id)

    setLikes(count || 0)

    if (!user) return

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle()

    setLiked(!!data)
  }

  async function toggleLike() {
  if (!user) return

  if (liked) {

    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id)

    setLiked(false)
    setLikes(v => Math.max(0, v - 1))

  } else {

    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id: post.id,
        user_id: user.id,
      })
      .select()

    setLiked(true)
    setLikes(v => v + 1)

  }

}
  return (
    <motion.div
    onMouseMove={(e) => {
      const rect = e.currentTarget.getBoundingClientRect()

      e.currentTarget.style.setProperty(
        "--x",
        `${e.clientX - rect.left}px`
      )

      e.currentTarget.style.setProperty(
        "--y",
        `${e.clientY - rect.top}px`
      )
    }}
      initial={{
        opacity: 0,
        y: 12,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
      }}

      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className="
      group
      relative
      overflow-hidden
      rounded-[34px]
      border
      border-white/10
      bg-gradient-to-br
      from-[#181B23]
      via-[#111318]
      to-[#0B0C10]
      p-8
      shadow-[0_30px_90px_rgba(0,0,0,.6)]
      transition-all
      duration-300
      hover:-translate-y-1
      hover:border-yellow-400/30
      hover:shadow-[0_30px_70px_rgba(0,0,0,.55)]
      "
    >
    <div
      className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
    >

      <div className ="
        absolute
        -top-32
        -right-20
        h-64
        w-64
        rounded-full
        bg-yellow-400/10
        blur-[120px]
      "/>
    </div>
      <div className="relative z-10 flex items-start justify-between mb-6">

        <div className="flex items-center gap-4">

          <div className="relative">

            <motion.div
                whileHover={{
                    rotate: 8,
                    scale: 1.08
                }}
                transition={{
                    duration: .25
                }}
                className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white/10"
            >

              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl">
                  👤
                </div>
              )}

            </motion.div>

            <span
              className="
                absolute
                bottom-0
                right-0
                h-3.5
                w-3.5
                rounded-full
                bg-green-400
                ring-2
                ring-[#181B23]
              "
            />
          </div>

          <div className="flex flex-col gap-1">
            <Link
                to={`/profile/${post.user_id}`}
                className="
                  text-lg
                  font-bold
                  tracking-wide
                  transition-all
                  duration-300
                  hover:text-yellow-300
                "
            >
            {post.profiles?.username || "Unknown User"}
          </Link>
          <p className="text-sm text-slate-400">
            {post.profiles?.role || "Unknown Role"}
          </p>
          <p className="text-xs text-yellow-400 mt-1">
            {post.profiles?.xp ?? "Unknown Xp"}
          </p>
          {user?.id === post.user_id && (
            <button
              onClick={() => deletePost(post.id)}
              className="text-red-500"
            >
              🗑 Удалить
            </button>
          )}

          <p className="text-xs text-slate-500 mt-2">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
          </div>
        </div>
      </div>
      <div className="relative z-10">

  <h2 className="text-3xl font-black mb-6">
    {post.title}
  </h2>

  {(post.post_sections || [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((section, index) => (
      <div
        key={section.id}
        className="mb-4 rounded-2xl border border-white/10 overflow-hidden"
      >
        <button
          onClick={() =>
            setOpenedSections((prev) => ({
              ...prev,
              [section.id]: !prev[section.id],
            }))
          }
          className="
            w-full
            flex
            items-center
            justify-between
            px-6
            py-4
            bg-white/5
            hover:bg-white/10
            transition
          "
        >
          <span className="font-bold text-lg">
            {section.title || `Section ${index + 1}`}
          </span>

          <span>
            {openedSections[section.id] ? "▲" : "▼"}
          </span>
        </button>

        <AnimatePresence>
          {openedSections[section.id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-5 whitespace-pre-wrap text-slate-300">
                {section.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))}
</div>
      <div className="relative z-10 mt-7 flex gap-3 border-t border-white/10 pt-5">

      <button
        onClick={toggleLike}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          px-4
          py-2
          transition-all
          duration-300
          hover:-translate-y-1
          active:scale-95
          hover:shadow-xl
          bg-white/5
        "
      >
        <motion.span
          animate={
            liked
              ? {
                  scale: [1, 1.45, 0.9, 1.15, 1],
                  rotate: [0, -12, 10, -4, 0],
                }
              : {
                  scale: [1, 0.92, 1],
                }
          }
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
          className={
            liked
              ? "text-pink-500 drop-shadow-[0_0_12px_rgba(236,72,153,.8)]"
              : ""
          }
        >
          ❤️
        </motion.span>

        <span>
          {likes}
        </span>
      </button>
      
      <button
        onClick={() => setShowComments(!showComments)}
        className="rounded-xl bg-white/5 px-4 py-2 transition-all duration-300 hover:bg-sky-500/20 hover:text-sky-400 hover:-translate-y-1 hover:shadow-xl active:scale-95"
      >
        💬 Comment
      </button>

      <button className="rounded-xl bg-white/5 px-4 py-2 transition-all duration-300 hover:bg-green-500/20 hover:text-green-400 hover:-translate-y-1 hover:shadow-xl active:scale-95">
      🔖 Save
      </button>

      </div>
      {showComments && (
        <CommentSection
          postId={post.id}
          user={user}
        />
      )}
    </motion.div>
    
    
  )
}