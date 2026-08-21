import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function CommentSection({
  postId,
  user,
}) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  async function loadComments() {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles(
          username,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setComments(data || [])
  }

  async function sendComment() {
    if (!text.trim()) return

    setSending(true)

    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text,
      })

    setSending(false)

    if (error) {
      alert(error.message)
      return
    }

    setText("")
    loadComments()
  }

  async function removeComment(id) {
    await supabase
      .from("comments")
      .delete()
      .eq("id", id)

    loadComments()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_12px_35px_rgba(15,23,42,0.08)]
      "
    >

      {/* Comments */}
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-3">

        {comments.length === 0 && (
          <div className="
            rounded-xl
            border
            border-dashed
            border-slate-200
            bg-slate-50
            px-5
            py-8
            text-center
          ">
            <div className="text-2xl">💬</div>

            <p className="mt-2 font-semibold text-slate-600">
              No comments yet
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Be the first to share your thoughts.
            </p>
          </div>
        )}

        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              rounded-xl
              border
              border-slate-100
              bg-slate-50
              p-4
              transition-all
              duration-200
              hover:border-yellow-200
              hover:bg-yellow-50/40
            "
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                {comment.profiles?.avatar_url ? (
                  <img
                    src={comment.profiles.avatar_url}
                    alt=""
                    className="
                      h-10
                      w-10
                      rounded-full
                      object-cover
                      ring-2
                      ring-white
                      shadow-sm
                    "
                  />
                ) : (
                  <div className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-yellow-100
                    text-lg
                    ring-2
                    ring-white
                  ">
                    👤
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-800">
                    {comment.profiles?.username || "Unknown"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>

              </div>

              {user?.id === comment.user_id && (
                <button
                  onClick={() => removeComment(comment.id)}
                  className="
                    rounded-lg
                    px-2
                    py-1
                    text-sm
                    text-slate-400
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                  "
                  title="Delete comment"
                >
                  🗑️
                </button>
              )}

            </div>

            <p className="
              mt-3
              whitespace-pre-wrap
              leading-6
              text-slate-600
            ">
              {comment.content}
            </p>

          </motion.div>
        ))}

      </div>

      {/* Write comment */}
      <div className="
        border-t
        border-slate-200
        bg-slate-50/70
        p-4
      ">

        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3
            text-slate-800
            outline-none
            transition-all
            duration-200
            placeholder:text-slate-400
            focus:border-yellow-400
            focus:ring-4
            focus:ring-yellow-100
          "
        />

        <motion.button
          whileHover={{
            scale: 1.01,
            y: -1,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={sendComment}
          disabled={sending}
          className="
            mt-3
            w-full
            rounded-xl
            bg-yellow-400
            py-3
            font-bold
            text-slate-900
            shadow-[0_8px_20px_rgba(234,179,8,0.16)]
            transition-all
            duration-200
            hover:bg-yellow-300
            hover:shadow-[0_10px_25px_rgba(234,179,8,0.22)]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {sending ? "Sending..." : "Send Comment"}
        </motion.button>

      </div>

    </motion.div>
  )
}