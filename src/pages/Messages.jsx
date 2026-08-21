import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../supabase"

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [user, setUser] = useState(null)
  const [sending, setSending] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [replyTo, setReplyTo] = useState(null)
  const [highlightedMessage, setHighlightedMessage] = useState(null)

  const [mentionUsers, setMentionUsers] = useState([])
  const [showMentionList, setShowMentionList] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionStart, setMentionStart] = useState(-1)

  const bottomRef = useRef(null)
  const messageRefs = useRef({})

  useEffect(() => {
    initialize()

    const messageChannel = supabase
      .channel("messages-room")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => loadMessages()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [])

  useEffect(() => {
    if (!user) return

    loadNotifications()

    const notificationChannel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => loadNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(notificationChannel)
    }
  }, [user])

  useEffect(() => {
    if (!showNotifications) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function initialize() {
    await loadUser()
    await loadMessages()
  }

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

  async function loadNotifications() {
    if (!user) return

    const { data, error } = await supabase
      .from("message_notifications")
      .select(`
        id,
        type,
        read,
        created_at,
        message_id,
        messages (
          id,
          content,
          user_id,
          created_at,
          profiles (
            username,
            avatar_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setNotifications(data || [])
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  async function searchMentionUsers(query) {
    if (!user) return

    const cleanQuery = query.trim()

    let request = supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .neq("id", user.id)
      .limit(8)

    if (cleanQuery) {
      request = request.ilike("username", `%${cleanQuery}%`)
    }

    const { data, error } = await request

    if (error) {
      console.error(error)
      return
    }

    setMentionUsers(data || [])
    setShowMentionList(true)
  }

  async function sendMessage() {
    if (!text.trim() || !user || sending) return

    setSending(true)

    const messageText = text.trim()

    const { data: insertedMessage, error } = await supabase
      .from("messages")
      .insert({
        user_id: user.id,
        content: messageText,
        reply_to: replyTo?.id || null,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert(error.message)
      setSending(false)
      return
    }

    if (replyTo && replyTo.user_id !== user.id) {
      await supabase.from("message_notifications").insert({
        user_id: replyTo.user_id,
        message_id: insertedMessage.id,
        type: "reply",
      })
    }

    const usernames = [
      ...messageText.matchAll(/@([a-zA-Z0-9_.-]+)/g),
    ].map((match) => match[1].toLowerCase())

    if (usernames.length) {
      const uniqueUsernames = [...new Set(usernames)]

      const { data: mentionedProfiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("username", uniqueUsernames)

      if (mentionedProfiles?.length) {
        const mentionNotifications = mentionedProfiles
          .filter((profile) => profile.id !== user.id)
          .map((profile) => ({
            user_id: profile.id,
            message_id: insertedMessage.id,
            type: "mention",
          }))

        if (mentionNotifications.length) {
          await supabase
            .from("message_notifications")
            .insert(mentionNotifications)
        }
      }
    }

    setText("")
    setReplyTo(null)
    setShowMentionList(false)
    setMentionQuery("")
    setMentionStart(-1)
    setSending(false)

    await loadMessages()
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

  async function openNotification(notification) {
    setShowNotifications(false)

    if (!notification.message_id) return

    await supabase
      .from("message_notifications")
      .update({ read: true })
      .eq("id", notification.id)

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notification.id
          ? { ...item, read: true }
          : item
      )
    )

    const targetId = notification.message_id

    setTimeout(() => {
      const element = messageRefs.current[targetId]

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        })

        setHighlightedMessage(targetId)

        setTimeout(() => {
          setHighlightedMessage(null)
        }, 1800)
      }
    }, 150)
  }

  function startReply(message) {
    setReplyTo(message)

    setTimeout(() => {
      document.querySelector("#message-input")?.focus()
    }, 50)
  }

  function cancelReply() {
    setReplyTo(null)
  }
  async function openMentionProfile(username) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle()

  if (error) {
    console.error(error)
    return
  }

  if (!data?.id) return

  window.location.href = `/profile/${data.id}`
}

  function handleTextChange(e) {
    const value = e.target.value
    const cursorPosition = e.target.selectionStart

    setText(value)

    const textBeforeCursor = value.slice(0, cursorPosition)

    const match = textBeforeCursor.match(
      /(^|\s)@([a-zA-Z0-9_.-]*)$/
    )

    if (!match) {
      setShowMentionList(false)
      setMentionQuery("")
      setMentionStart(-1)
      return
    }

    const query = match[2]
    const start = cursorPosition - query.length - 1

    setMentionQuery(query)
    setMentionStart(start)

    searchMentionUsers(query)
  }

  function selectMention(profile) {
    if (mentionStart === -1) return

    const before = text.slice(0, mentionStart)
    const after = text.slice(
      mentionStart + mentionQuery.length + 1
    )

    const newText =
      before + `@${profile.username} ` + after

    setText(newText)
    setShowMentionList(false)
    setMentionQuery("")
    setMentionStart(-1)

    setTimeout(() => {
      const input = document.querySelector("#message-input")
      input?.focus()

      if (input) {
        input.selectionStart = newText.length
        input.selectionEnd = newText.length
      }
    }, 50)
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setShowMentionList(false)
      return
    }

    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !showMentionList
    ) {
      e.preventDefault()
      sendMessage()
    }
  }

  function getReplyMessage(id) {
    if (!id) return null

    return messages.find(
      (message) => message.id === id
    )
  }

  function renderMessageContent(content) {
    const parts = content.split(/(@[a-zA-Z0-9_.-]+)/g)

    return parts.map((part, index) => {
      if (!part.startsWith("@")) {
        return <span key={index}>{part}</span>
      }

      const username = part.slice(1)

      return (
        <Link
          key={index}
          to={`/profile/${profile.id}`}
          className="
            font-bold
            text-yellow-700
            underline-offset-2
            transition
            hover:text-yellow-900
            hover:underline
          "
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      )
    })
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
          border border-slate-200
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,.12)]
        "
      >
        {/* HEADER */}

        <div
          className="
            relative
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

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900">
                Messages
              </h1>

              <p className="mt-2 text-slate-500">
                Talk with everyone in the EDU community.
              </p>
            </div>

            {/* NOTIFICATIONS */}

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() =>
                  setShowNotifications((value) => !value)
                }
                className="
                  relative flex h-14 w-14 items-center
                  justify-center rounded-full border
                  border-slate-200 bg-white text-2xl
                  shadow-sm transition hover:border-yellow-300
                  hover:bg-yellow-50
                "
              >
                🔔

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute -right-1 -top-1 flex min-h-6
                      min-w-6 items-center justify-center
                      rounded-full bg-red-500 px-1.5 text-xs
                      font-black text-white ring-4 ring-white
                    "
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    className="
                      absolute right-0 top-16 z-50 w-[360px]
                      max-w-[calc(100vw-40px)] overflow-hidden
                      rounded-3xl border border-slate-200 bg-white
                      shadow-[0_25px_80px_rgba(15,23,42,.18)]
                    "
                  >
                    <div
                      className="
                        border-b border-slate-200
                        bg-gradient-to-r from-yellow-50
                        to-violet-50 px-5 py-4
                      "
                    >
                      <h3 className="font-black text-slate-900">
                        Mentions & Replies
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        People who reached out to you
                      </p>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <div className="text-4xl">🔔</div>

                          <p className="mt-3 font-bold text-slate-700">
                            No mentions or replies
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            You are all caught up.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const message =
                            notification.messages

                          if (!message) return null

                          return (
                            <button
                              key={notification.id}
                              onClick={() =>
                                openNotification(notification)
                              }
                              className={`
                                w-full border-b border-slate-100
                                px-5 py-4 text-left transition
                                hover:bg-yellow-50
                                ${
                                  !notification.read
                                    ? "bg-yellow-50/50"
                                    : "bg-white"
                                }
                              `}
                            >
                              <div className="flex gap-3">
                                <div
                                  className="
                                    h-10 w-10 shrink-0 overflow-hidden
                                    rounded-full bg-yellow-400
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
                                        flex h-full w-full
                                        items-center justify-center
                                        font-bold text-slate-900
                                      "
                                    >
                                      {(
                                        message.profiles?.username?.[0] ||
                                        "?"
                                      ).toUpperCase()}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">
                                      {message.profiles?.username ||
                                        "Unknown"}
                                    </span>

                                    {!notification.read && (
                                      <span className="h-2 w-2 rounded-full bg-red-500" />
                                    )}
                                  </div>

                                  <p className="mt-0.5 text-xs font-semibold text-yellow-600">
                                    {notification.type === "mention"
                                      ? "Mentioned you"
                                      : "Replied to you"}
                                  </p>

                                  <p className="whitespace-pre-wrap break-words">
  {message.content.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, index) => {
    if (!part.startsWith("@")) {
      return <span key={index}>{part}</span>
    }

    const username = part.slice(1)

    return (
      <button
        key={index}
        type="button"
        onClick={() => openMentionProfile(username)}
        className="
          font-bold
          text-yellow-600
          transition
          hover:text-yellow-700
          hover:underline
        "
      >
        {part}
      </button>
    )
  })}
</p>
                                </div>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* MESSAGES */}

        <div className="h-[520px] overflow-y-auto bg-white px-5 py-6 md:px-7">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-6xl">💬</div>

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
                  getReplyMessage(message.reply_to)

                return (
                  <motion.div
                    key={message.id}
                    ref={(element) => {
                      messageRefs.current[message.id] = element
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      flex gap-3 rounded-2xl
                      transition-all duration-500
                      ${
                        ownMessage
                          ? "justify-end"
                          : "justify-start"
                      }
                      ${
                        highlightedMessage === message.id
                          ? "bg-yellow-100/70 p-3"
                          : ""
                      }
                    `}
                  >
                    {!ownMessage && (
                      <Link
                        to={`/profile/${message.user_id}`}
                        className="
                          h-10 w-10 shrink-0 overflow-hidden
                          rounded-full ring-2 ring-slate-100
                          transition hover:scale-105
                        "
                        title={`Open ${
                          message.profiles?.username || "profile"
                        }'s profile`}
                      >
                        {message.profiles?.avatar_url ? (
                          <img
                            src={message.profiles.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="
                              flex h-full w-full items-center
                              justify-center bg-yellow-400
                              font-bold text-slate-900
                            "
                          >
                            {(
                              message.profiles?.username?.[0] ||
                              "?"
                            ).toUpperCase()}
                          </div>
                        )}
                      </Link>
                    )}

                    <div
                      className={`max-w-[75%] ${
                        ownMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <Link
                        to={`/profile/${message.user_id}`}
                        className="
                          mb-1 block w-fit px-1 text-sm font-bold
                          text-yellow-600 transition hover:text-yellow-700
                          hover:underline
                        "
                      >
                        {message.profiles?.username || "Unknown"}
                      </Link>

                      {/* REPLY PREVIEW */}

                      {repliedMessage && (
                        <button
                          onClick={() => {
                            const element =
                              messageRefs.current[
                                repliedMessage.id
                              ]

                            element?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            })
                          }}
                          className="
                            mb-1 w-full rounded-xl border-l-4
                            border-yellow-400 bg-yellow-50 px-3 py-2
                            text-left text-xs text-slate-500
                            transition hover:bg-yellow-100
                          "
                        >
                          <span className="font-bold text-yellow-600">
                            Replying to{" "}
                            {repliedMessage.profiles?.username ||
                              "Unknown"}
                          </span>

                          <p className="mt-0.5 line-clamp-1">
                            {repliedMessage.content}
                          </p>
                        </button>
                      )}

                      <div
                        className={`
                          rounded-2xl px-4 py-3 shadow-sm
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
                                border border-slate-200
                                bg-slate-50 text-slate-800
                              `
                          }
                        `}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {renderMessageContent(message.content)}
                        </p>
                      </div>

                      <div
                        className={`
                          mt-1 flex items-center gap-2 px-1
                          text-xs text-slate-400
                          ${ownMessage ? "justify-end" : ""}
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
                          onClick={() => startReply(message)}
                          className="
                            font-semibold text-slate-400
                            transition hover:text-yellow-600
                          "
                        >
                          Reply
                        </button>

                        {ownMessage && (
                          <button
                            onClick={() =>
                              deleteMessage(message.id)
                            }
                            className="
                              text-red-400 transition
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
            border-t border-slate-200
            bg-slate-50 p-5
          "
        >
          {/* REPLY BAR */}

          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div
                  className="
                    flex items-center justify-between gap-3
                    rounded-2xl border border-yellow-200
                    bg-yellow-50 px-4 py-3
                  "
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-yellow-600">
                      Replying to{" "}
                      {replyTo.profiles?.username || "Unknown"}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {replyTo.content}
                    </p>
                  </div>

                  <button
                    onClick={cancelReply}
                    className="
                      shrink-0 rounded-full px-3 py-1
                      text-sm font-bold text-slate-400
                      transition hover:bg-white hover:text-slate-700
                    "
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* COMPOSER */}

          <div className="relative flex gap-3">
            <AnimatePresence>
              {showMentionList && mentionUsers.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98,
                  }}
                  className="
                    absolute bottom-full left-0 z-50 mb-3
                    w-[320px] max-w-[calc(100vw-40px)]
                    overflow-hidden rounded-2xl border
                    border-slate-200 bg-white
                    shadow-[0_20px_60px_rgba(15,23,42,.18)]
                  "
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mention someone
                    </p>
                  </div>

                  <div className="max-h-[280px] overflow-y-auto p-2">
                    {mentionUsers.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectMention(profile)
                        }}
                        className="
                          flex w-full items-center gap-3 rounded-xl
                          px-3 py-2.5 text-left transition
                          hover:bg-yellow-50
                        "
                      >
                        <div
                          className="
                            h-10 w-10 shrink-0 overflow-hidden
                            rounded-full bg-yellow-400 ring-1
                            ring-slate-200
                          "
                        >
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="
                                flex h-full w-full items-center
                                justify-center font-bold text-slate-900
                              "
                            >
                              {(
                                profile.username?.[0] || "?"
                              ).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            @{profile.username}
                          </p>

                          <p className="text-xs text-slate-400">
                            Open profile
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <textarea
              id="message-input"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder={
                replyTo
                  ? "Write a reply..."
                  : "Write a message... Use @username to mention someone"
              }
              className="
                min-w-0 flex-1 resize-none rounded-2xl
                border border-slate-200 bg-white px-5 py-4
                text-slate-800 shadow-sm outline-none transition
                placeholder:text-slate-400
                focus:border-yellow-400
                focus:ring-4 focus:ring-yellow-400/10
              "
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={sendMessage}
              disabled={sending || !text.trim()}
              className="
                self-end rounded-2xl
                bg-gradient-to-r from-yellow-400 to-amber-500
                px-7 py-4 font-black text-slate-900
                shadow-sm transition hover:shadow-md
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              {sending ? "..." : "Send"}
            </motion.button>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Enter to send · Shift + Enter for a new line · @username to mention
          </p>
        </div>
      </div>
    </motion.div>
  )
}
