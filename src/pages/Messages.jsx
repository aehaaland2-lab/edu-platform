import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [user, setUser] = useState(null)
  const [sending, setSending] = useState(false)

  const bottomRef = useRef(null)

  useEffect(() => {
    loadUser()
    loadMessages()

    const channel = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    setUser(user)
  }

  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          username,
          avatar_url
        )
      `)
      .order("created_at", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setMessages(data || [])
  }

  async function sendMessage() {
    if (!text.trim() || !user || sending) return

    setSending(true)

    const { error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        content: text.trim(),
      })

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setText("")
    }

    setSending(false)
  }

  async function deleteMessage(id) {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)

    if (error) {
      console.error(error)
      alert(error.message)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl pb-10"
    >
      <div
        className="
          overflow-hidden
          rounded-[32px]
          border border-white/10
          bg-[#111318]
          shadow-[0_30px_100px_rgba(0,0,0,.35)]
        "
      >
        {/* HEADER */}

        <div
          className="
            border-b border-white/10
            bg-gradient-to-r
            from-yellow-400/10
            via-transparent
            to-violet-500/10
            px-7 py-6
          "
        >
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
            Community
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Messages
          </h1>

          <p className="mt-2 text-slate-400">
            Talk with everyone in the EDU community.
          </p>
        </div>

        {/* MESSAGES */}

        <div className="h-[520px] overflow-y-auto px-5 py-6 md:px-7">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-6xl">💬</div>

                <h2 className="mt-4 text-2xl font-black">
                  No messages yet
                </h2>

                <p className="mt-2 text-slate-400">
                  Be the first one to say something.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const ownMessage = message.user_id === user?.id

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      ownMessage
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!ownMessage && (
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        {message.profiles?.avatar_url ? (
                          <img
                            src={message.profiles.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-yellow-400 font-bold text-black">
                            {(
                              message.profiles?.username?.[0] || "?"
                            ).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[75%] ${
                        ownMessage
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {!ownMessage && (
                        <p className="mb-1 px-1 text-sm font-bold text-yellow-400">
                          {message.profiles?.username || "Unknown"}
                        </p>
                      )}

                      <div
                        className={`
                          rounded-2xl px-4 py-3
                          ${
                            ownMessage
                              ? "rounded-br-md bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                              : "rounded-bl-md bg-[#1A1D24] text-slate-100"
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      <div
                        className={`mt-1 flex items-center gap-2 px-1 text-xs text-slate-500 ${
                          ownMessage ? "justify-end" : ""
                        }`}
                      >
                        <span>
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {ownMessage && (
                          <button
                            onClick={() =>
                              deleteMessage(message.id)
                            }
                            className="text-red-400 transition hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* INPUT */}

        <div className="border-t border-white/10 bg-[#0F1117] p-5">
          <div className="flex gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Write a message..."
              className="
                min-w-0
                flex-1
                resize-none
                rounded-2xl
                border border-white/10
                bg-[#171A22]
                px-5 py-4
                text-white
                outline-none
                transition
                placeholder:text-slate-500
                focus:border-yellow-400
              "
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="
                self-end
                rounded-2xl
                bg-gradient-to-r
                from-yellow-400
                to-amber-500
                px-7 py-4
                font-black
                text-black
                transition
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {sending ? "..." : "Send"}
            </motion.button>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </motion.div>
  )
}