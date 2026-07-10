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
      .order("created_at",{ascending:true})

    if(error){
      console.error(error)
      return
    }

    setComments(data || [])

  }

  async function sendComment(){

    if(!text.trim()) return

    setSending(true)

    const { error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: text,
      })

    setSending(false)

    if(error){
      alert(error.message)
      return
    }

    setText("")
    loadComments()
  }

  async function removeComment(id){

    await supabase
      .from("comments")
      .delete()
      .eq("id",id)

    loadComments()

  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="
        mt-5
        rounded-2xl
        border
        border-white/10
        bg-[#111318]
        overflow-hidden
        shadow-[0_10px_40px_rgba(0,0,0,.35)]
    "
    >

      <div className="max-h-[260px] overflow-y-auto p-4 space-y-3">

        {comments.length === 0 && (
          <p className="text-center text-slate-500">
            No comments yet.
          </p>
        )}

        {comments.map((comment) => (

          <div
            key={comment.id}
            className="
              rounded-xl
              bg-[#1A1D24]
              p-4
            "
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                {comment.profiles?.avatar_url ? (

                  <img
                    src={comment.profiles.avatar_url}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />

                ) : (

                  <div className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    👤
                  </div>

                )}

                <div>

                  <p className="font-bold">
                    {comment.profiles?.username || "Unknown"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>

                </div>

              </div>

              {user?.id === comment.user_id && (

                <button
                  onClick={() => removeComment(comment.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  🗑
                </button>

              )}

            </div>

            <p className="mt-3 whitespace-pre-wrap text-slate-200">
              {comment.content}
            </p>

          </div>

        ))}

      </div>

      <div className="border-t border-white/10 p-4">
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
            border-white/10
            bg-black/20
            px-4
            py-3
            outline-none
            transition
            focus:border-yellow-400
          "
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={sendComment}
          disabled={sending}
          className="
            mt-4
            w-full
            rounded-xl
            bg-gradient-to-r
            from-yellow-400
            to-amber-500
            py-3
            font-bold
            text-black
            disabled:opacity-60
          "
        >
          {sending ? "Sending..." : "Send"}
        </motion.button>

      </div>

    </motion.div>

  )

}