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

      if (error) {
        console.error(error)
        return
      }

      setLiked(false)
      setLikes((v) => Math.max(0, v - 1))
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({
          post_id: post.id,
          user_id: user.id,
        })

      if (error) {
        console.error(error)
        return
      }

      setLiked(true)
      setLikes((v) => v + 1)
    }
  }

  function toggleSection(id) {
    setOpenedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        p-7
        shadow-[0_12px_40px_rgba(15,23,42,.07)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-yellow-300
        hover:shadow-[0_20px_55px_rgba(15,23,42,.11)]
        hover:border-yellow-300
      "
    >
      <div className="
        pointer-events-none
        absolute
        -right-24
        -top-24
        h-56
        w-56
        rounded-full
        bg-yellow-200/30
        blur-[80px]
        opacity-0
        transition-opacity
        duration-500
        group-hover:opacity-100
      " />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="
                h-12
                w-12
                shrink-0
                overflow-hidden
                rounded-2xl
                bg-slate-100
                ring-1
                ring-slate-200
              "
            >
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  className="h-full w-full object-cover"
                  alt=""
                />
              ) : (
                <div className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  bg-slate-100
                  text-lg
                ">
                  👤
                </div>
              )}
            </motion.div>

            <div className="min-w-0">
              <Link
                to={`/profile/${post.user_id}`}
                className="
                  block
                  truncate
                  text-base
                  font-bold
                  text-slate-950
                  transition-colors
                  hover:text-yellow-600
                "
              >
                {post.profiles?.username || "Unknown User"}
              </Link>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{post.profiles?.role || "Unknown Role"}</span>
                <span>•</span>
                <span>{post.profiles?.xp ?? 0} XP</span>
                <span>•</span>
                <span>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {user?.id === post.user_id && (
            <button
              onClick={() => deletePost(post.id)}
              className="
                shrink-0
                rounded-xl
                px-3
                py-2
                text-sm
                font-medium
                text-slate-400
                transition
                hover:bg-red-50
                hover:text-red-500
              "
            >
              Delete
            </button>
          )}
        </div>

        <div className="mt-7">
          <h2 className="
            text-2xl
            font-black
            leading-tight
            tracking-tight
            text-slate-950
          ">
            {post.title}
          </h2>

          {(post.post_sections || [])
            .slice()
            .sort((a, b) => a.order_index - b.order_index)
            .map((section, index) => (
              <div
                key={section.id}
                className="
                  mt-4
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50/70
                "
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    hover:bg-yellow-50
                  "
                >
                  <span className="font-bold text-slate-900">
                    {section.title || `Section ${index + 1}`}
                  </span>

                  <span className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-sm
                    text-slate-500
                    shadow-sm
                  ">
                    {openedSections[section.id] ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openedSections[section.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="
                        border-t
                        border-slate-200
                        bg-white
                        px-5
                        py-5
                        whitespace-pre-wrap
                        text-[15px]
                        leading-7
                        text-slate-600
                      ">
                        {section.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
        </div>

        <div className="
          mt-7
          flex
          flex-wrap
          gap-2
          border-t
          border-slate-200
          pt-5
        ">
          <button
            onClick={toggleLike}
            className={`
              flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-semibold
              transition-all
              active:scale-95
              ${liked
                ? "bg-pink-50 text-pink-600"
                : "bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600"}
            `}
          >
            <motion.span
              animate={
                liked
                  ? {
                      scale: [1, 1.35, 0.95, 1.1, 1],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
            >
              ❤️
            </motion.span>
            {likes}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="
              rounded-xl
              bg-slate-100
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-blue-50
              hover:text-blue-600
              active:scale-95
            "
          >
            💬 Comment
          </button>

          <button
            className="
              rounded-xl
              bg-slate-100
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-yellow-50
              hover:text-yellow-700
              active:scale-95
            "
          >
            🔖 Save
          </button>
        </div>

        {showComments && (
          <CommentSection
            postId={post.id}
            user={user}
          />
        )}
      </div>
    </motion.article>
  )
}
