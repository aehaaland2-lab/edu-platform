import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [text, setText] = useState("")
  const [user, setUser] = useState(null)
  const [sending, setSending] = useState(false)

  const [replyingTo, setReplyingTo] = useState(null)
  const [mentionQuery, setMentionQuery] = useState("")
  const [showMentions, setShowMentions] = useState(false)

  const bottomRef = useRef(null)
  const messageRefs = useRef({})

  useEffect(() => {
    loadUser()
    loadMessages()
    loadUsers()

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
        reply_to,
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

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .order("username", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setUsers(data || [])
  }

  async function sendMessage() {
    if (!text.trim() || !user || sending) return

    setSending(true)

    const { error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        content: text.trim(),
        reply_to: replyingTo?.id || null,
      })

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      setText("")
      setReplyingTo(null)
      setMentionQuery("")
      setShowMentions(false)
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

  function startReply(message) {
    setReplyingTo(message)
    setShowMentions(false)
  }

  function cancelReply() {
    setReplyingTo(null)
  }

  function scrollToMessage(id) {
    const element = messageRefs.current[id]

    if (!element) return

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }

  function handleTextChange(e) {
    const value = e.target.value

    setText(value)

    const cursor = e.target.selectionStart
    const beforeCursor = value.slice(0, cursor)

    const match = beforeCursor.match(/@([a-zA-Z0-9_.-]*)$/)

    if (match) {
      setMentionQuery(match[1])
      setShowMentions(true)
    } else {
      setMentionQuery("")
      setShowMentions(false)
    }
  }

  function insertMention(selectedUser) {
    const cursor = document.activeElement?.selectionStart ?? text.length
    const beforeCursor = text.slice(0, cursor)
    const afterCursor = text.slice(cursor)

    const match = beforeCursor.match(/@([a-zA-Z0-9_.-]*)$/)

    if (!match) return

    const start = cursor - match[0].length

    const newText =
      beforeCursor.slice(0, start) +
      `@${selectedUser.username} ` +
      afterCursor

    setText(newText)
    setMentionQuery("")
    setShowMentions(false)
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }

    if (e.key === "Escape") {
      setShowMentions(false)
    }
  }

  const filteredUsers = users
    .filter((profile) => profile.id !== user?.id)
    .filter((profile) =>
      (profile.username || "")
        .toLowerCase()
        .includes(mentionQuery.toLowerCase())
    )
    .slice(0, 6)

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
          border border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,.12)]
        "
      >

        {/* HEADER */}

        <div
          className="
            border-b border-slate-200
            bg-gradient-to-r
            from-yellow-50
            via-white
            to-violet-50
            px-7 py-6
          "
        >
          <p className="text-sm uppercase tracking-[0.3em] text-yellow-500 font-semibold">
            Community
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-900">
            Messages
          </h1>

          <p className="mt-2 text-slate-500">
            Talk with everyone in the EDU community.
          </p>
        </div>

        {/* MESSAGES */}

        <div className="h-[520px] overflow-y-auto bg-white px-5 py-6 md:px-7">

          {messages.length === 0 ? (

            <div className="flex h-full items-center justify-center">

              <div className="text-center">

                <div className="text-6xl">
                  💬
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-800">
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

                const ownMessage =
                  message.user_id === user?.id

                const repliedMessage =
                  message.reply_to
                    ? messages.find(
                        (item) =>
                          item.id === message.reply_to
                      )
                    : null

                return (

                  <motion.div
                    key={message.id}
                    ref={(element) => {
                      messageRefs.current[message.id] =
                        element
                    }}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`flex gap-3 ${
                      ownMessage
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    {!ownMessage && (

                      <div
                        className="
                          h-10
                          w-10
                          shrink-0
                          overflow-hidden
                          rounded-full
                          ring-2
                          ring-slate-100
                        "
                      >

                        {message.profiles?.avatar_url ? (

                          <img
                            src={
                              message.profiles.avatar_url
                            }
                            alt=""
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div
                            className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                              bg-yellow-400
                              font-bold
                              text-slate-900
                            "
                          >
                            {(
                              message.profiles
                                ?.username?.[0] || "?"
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

                        <p className="mb-1 px-1 text-sm font-bold text-yellow-600">
                          {message.profiles?.username ||
                            "Unknown"}
                        </p>

                      )}

                      {/* REPLY PREVIEW */}

                      {repliedMessage && (

                        <button
                          onClick={() =>
                            scrollToMessage(
                              repliedMessage.id
                            )
                          }
                          className="
                            mb-2
                            w-full
                            rounded-xl
                            border-l-4
                            border-yellow-400
                            bg-slate-50
                            px-4
                            py-2
                            text-left
                            transition
                            hover:bg-yellow-50
                          "
                        >

                          <p className="text-xs font-bold text-yellow-600">
                            Replying to{" "}
                            {repliedMessage.profiles
                              ?.username ||
                              "Unknown"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {repliedMessage.content}
                          </p>

                        </button>

                      )}

                      <div
                        className={`
                          rounded-2xl
                          px-4
                          py-3
                          shadow-sm
                          ${
                            ownMessage
                              ? `
                                rounded-br-md
                                bg-gradient-to-r
                                from-yellow-400
                                to-amber-500
                                text-slate-900
                              `
                              : `
                                rounded-bl-md
                                border
                                border-slate-200
                                bg-slate-50
                                text-slate-800
                              `
                          }
                        `}
                      >

                        <p className="whitespace-pre-wrap break-words">
                          {message.content
                            .split(
                              /(@[a-zA-Z0-9_.-]+)/
                            )
                            .map((part, index) =>
                              part.startsWith("@") ? (
                                <span
                                  key={index}
                                  className="
                                    font-bold
                                    text-yellow-700
                                  "
                                >
                                  {part}
                                </span>
                              ) : (
                                part
                              )
                            )}
                        </p>

                      </div>

                      {/* ACTIONS */}

                      <div
                        className={`
                          mt-1
                          flex
                          items-center
                          gap-3
                          px-1
                          text-xs
                          text-slate-400
                          ${
                            ownMessage
                              ? "justify-end"
                              : ""
                          }
                        `}
                      >

                        <span>
                          {new Date(
                            message.created_at
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <button
                          onClick={() =>
                            startReply(message)
                          }
                          className="
                            font-medium
                            transition
                            hover:text-yellow-600
                          "
                        >
                          Reply
                        </button>

                        {ownMessage && (

                          <button
                            onClick={() =>
                              deleteMessage(
                                message.id
                              )
                            }
                            className="
                              text-red-400
                              transition
                              hover:text-red-500
                            "
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

        <div
          className="
            border-t
            border-slate-200
            bg-slate-50
            p-5
          "
        >

          {/* REPLY BAR */}

          {replyingTo && (

            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-yellow-200
                bg-yellow-50
                px-4
                py-3
              "
            >

              <div className="min-w-0">

                <p className="text-xs font-bold text-yellow-700">
                  Replying to{" "}
                  {replyingTo.profiles?.username ||
                    "Unknown"}
                </p>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {replyingTo.content}
                </p>

              </div>

              <button
                onClick={cancelReply}
                className="
                  ml-4
                  shrink-0
                  rounded-full
                  px-3
                  py-1
                  text-sm
                  font-bold
                  text-slate-400
                  transition
                  hover:bg-white
                  hover:text-slate-700
                "
              >
                ×
              </button>

            </div>

          )}

          <div className="relative">

            {/* MENTION DROPDOWN */}

            {showMentions &&
              filteredUsers.length > 0 && (

                <div
                  className="
                    absolute
                    bottom-full
                    left-0
                    z-50
                    mb-2
                    w-72
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-[0_20px_50px_rgba(15,23,42,.15)]
                  "
                >

                  <div className="border-b border-slate-100 px-4 py-3">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mention someone
                    </p>

                  </div>

                  <div className="max-h-64 overflow-y-auto">

                    {filteredUsers.map(
                      (profile) => (

                        <button
                          key={profile.id}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            insertMention(
                              profile
                            )
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-4
                            py-3
                            text-left
                            transition
                            hover:bg-yellow-50
                          "
                        >

                          <div
                            className="
                              h-9
                              w-9
                              shrink-0
                              overflow-hidden
                              rounded-full
                              bg-yellow-100
                            "
                          >

                            {profile.avatar_url ? (

                              <img
                                src={
                                  profile.avatar_url
                                }
                                alt=""
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div
                                className="
                                  flex
                                  h-full
                                  w-full
                                  items-center
                                  justify-center
                                  font-bold
                                  text-yellow-700
                                "
                              >
                                {(
                                  profile.username?.[0] ||
                                  "?"
                                ).toUpperCase()}
                              </div>

                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-bold text-slate-800">
                              {profile.username ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-slate-400">
                              @{profile.username}
                            </p>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                </div>

              )}

            <div className="flex gap-3">

              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Write a message..."
                className="
                  min-w-0
                  flex-1
                  resize-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-5
                  py-4
                  text-slate-800
                  shadow-sm
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-yellow-400
                  focus:ring-4
                  focus:ring-yellow-400/10
                "
              />

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={sendMessage}
                disabled={
                  sending ||
                  !text.trim()
                }
                className="
                  self-end
                  rounded-2xl
                  bg-gradient-to-r
                  from-yellow-400
                  to-amber-500
                  px-7
                  py-4
                  font-black
                  text-slate-900
                  shadow-sm
                  transition
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {sending ? "..." : "Send"}
              </motion.button>

            </div>

          </div>

          <p className="mt-2 text-xs text-slate-400">
            Press Enter to send · Shift + Enter for a new line ·
            Type @ to mention someone
          </p>

        </div>

      </div>
    </motion.div>
  )
}