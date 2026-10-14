import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import CommentSection from "./CommentSection"

// Справочник уроков (предметов) со значками и стилями бейджей
export const SUBJECTS = {
  Математика: {
    icon: "📐",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  Физика: {
    icon: "⚛️",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  Информатика: {
    icon: "💻",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Химия: {
    icon: "🧪",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  Биология: {
    icon: "🧬",
    badge: "border-green-200 bg-green-50 text-green-700",
  },
  История: {
    icon: "🏛️",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  Английский: {
    icon: "🇬🇧",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  Литература: {
    icon: "📚",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
  },
  География: {
    icon: "🌍",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  Общее: {
    icon: "✨",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
}

// Извлекает ID видео из любой ссылки YouTube (watch?v=, youtu.be/, embed/, shorts/)
export function extractYouTubeId(url) {
  if (!url) return null
  const clean = url.trim().replace(/[),.;]+$/, "")
  const regExp =
    /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = clean.match(regExp)
  return match ? match[1] : null
}

// Рендерит одну строку текста с поддержкой [Названия](url), обычных ссылок (Wikipedia и др.) и встроенного YouTube
function renderRichContent(text) {
  if (!text) return null

  const lines = text.split("\n")

  return lines.map((line, lineIndex) => {
    const trimmed = line.trim()

    // 1. Если вся строка — это ссылка на YouTube или Markdown-ссылка на YouTube -> рендерим плеер как в Notion
    const directYtId = extractYouTubeId(trimmed)
    const mdSingleMatch = trimmed.match(
      /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/
    )
    const mdYtId = mdSingleMatch
      ? extractYouTubeId(mdSingleMatch[2])
      : null

    const standaloneVideoId = directYtId || mdYtId

    if (standaloneVideoId) {
      return (
        <div
          key={lineIndex}
          className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-md aspect-video w-full max-h-[440px]"
        >
          <iframe
            src={`https://www.youtube.com/embed/${standaloneVideoId}`}
            title="YouTube video player"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }

    // 2. Ищем внутри строки также любые ссылки (Markdown `[Текст](url)` или обычные `https://...`)
    const tokenRegex =
      /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s]+)/g
    const parts = line.split(tokenRegex)

    // Если внутри строки встретилась ссылка на YouTube, покажем плеер сразу под абзацем
    const inlineYoutubeIds = []

    const renderedParts = parts.map((part, partIndex) => {
      if (!part) return null

      // Проверка на Markdown ссылку: [Название](https://...)
      const mdMatch = part.match(
        /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/
      )

      if (mdMatch) {
        const label = mdMatch[1]
        const url = mdMatch[2]
        const ytId = extractYouTubeId(url)

        if (ytId) {
          inlineYoutubeIds.push(ytId)
        }

        const isWiki = url.toLowerCase().includes("wikipedia.org")

        return (
          <a
            key={partIndex}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              mx-1
              inline-flex
              items-center
              gap-1.5
              rounded-xl
              border
              border-yellow-300
              bg-yellow-50
              px-3
              py-0.5
              text-sm
              font-bold
              text-yellow-800
              transition
              hover:bg-yellow-100
              hover:underline
            "
          >
            <span>{isWiki ? "📖" : "🔗"}</span>
            <span>{label}</span>
          </a>
        )
      }

      // Проверка на обычную ссылку: https://...
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        const cleanUrl = part.replace(/[),.;]+$/, "")
        const ytId = extractYouTubeId(cleanUrl)

        if (ytId) {
          inlineYoutubeIds.push(ytId)
          return (
            <span
              key={partIndex}
              className="mx-1 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600"
            >
              🎬 YouTube Видео
            </span>
          )
        }

        const isWiki = cleanUrl
          .toLowerCase()
          .includes("wikipedia.org")

        let displayHost = cleanUrl
        try {
          const parsed = new URL(cleanUrl)
          if (isWiki) {
            const wikiTitle = decodeURIComponent(
              parsed.pathname.split("/").pop() || ""
            ).replace(/_/g, " ")
            displayHost = wikiTitle
              ? `Wikipedia: ${wikiTitle}`
              : "Wikipedia"
          } else {
            displayHost =
              parsed.hostname.replace(/^www\./, "") +
              (parsed.pathname !== "/" ? parsed.pathname : "")
          }
        } catch {
          displayHost = cleanUrl
        }

        return (
          <a
            key={partIndex}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              mx-1
              inline-flex
              items-center
              gap-1.5
              rounded-xl
              border
              border-slate-200
              bg-slate-100
              px-3
              py-0.5
              text-sm
              font-bold
              text-slate-800
              transition
              hover:border-yellow-300
              hover:bg-yellow-50
              hover:text-yellow-800
            "
          >
            <span>{isWiki ? "📖" : "🌐"}</span>
            <span className="max-w-[280px] truncate">
              {displayHost}
            </span>
          </a>
        )
      }

      return <span key={partIndex}>{part}</span>
    })

    return (
      <div key={lineIndex} className="min-h-[1.5rem]">
        {renderedParts}

        {inlineYoutubeIds.map((ytId, idx) => (
          <div
            key={`${ytId}-${idx}`}
            className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-md aspect-video w-full max-h-[440px]"
          >
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube video player"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ))}
      </div>
    )
  })
}

export default function PostCard({ post, deletePost, user }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [openedSections, setOpenedSections] = useState({})

  const subjectName =
    (post.subject && SUBJECTS[post.subject] && post.subject) ||
    (post.content && SUBJECTS[post.content] && post.content) ||
    "Общее"
  const subjectMeta = SUBJECTS[subjectName] || SUBJECTS["Общее"]

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
      "
    >
      <div
        className="
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
        "
      />

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4">
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
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    bg-slate-100
                    text-lg
                  "
                >
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
                <span>
                  {post.profiles?.role || "Unknown Role"}
                </span>

                <span>•</span>

                <span>{post.profiles?.xp ?? 0} XP</span>

                <span>•</span>

                <span>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ЗНАЧОК УРОКА (ПРЕДМЕТА) */}
            <div
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-3.5
                py-1.5
                text-xs
                font-bold
                ${subjectMeta.badge}
              `}
            >
              <span>{subjectMeta.icon}</span>
              <span>{subjectName}</span>
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
        </div>

        {/* CONTENT */}
        <div className="mt-7">
          <h2
            className="
              text-2xl
              font-black
              leading-tight
              tracking-tight
              text-slate-950
            "
          >
            {post.title}
          </h2>

          {/* POST IMAGE */}
          {post.image_url && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="
                mt-5
                flex
                max-h-[420px]
                w-full
                items-center
                justify-center
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-slate-100
              "
            >
              <img
                src={post.image_url}
                alt={post.title || "Post image"}
                className="
                  max-h-[420px]
                  max-w-full
                  object-contain
                "
              />
            </motion.div>
          )}

          {/* SECTIONS */}
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

                  <span
                    className="
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
                    "
                  >
                    {openedSections[section.id] ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {openedSections[section.id] && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.22,
                      }}
                      className="overflow-hidden"
                    >
                      <div
                        className="
                          border-t
                          border-slate-200
                          bg-white
                          px-5
                          py-5
                          text-[15px]
                          leading-7
                          text-slate-600
                        "
                      >
                        {renderRichContent(section.content)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
        </div>

        {/* ACTIONS */}
        <div
          className="
            mt-7
            flex
            flex-wrap
            gap-2
            border-t
            border-slate-200
            pt-5
          "
        >
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
              ${
                liked
                  ? "bg-pink-50 text-pink-600"
                  : "bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-pink-600"
              }
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

        {/* COMMENTS */}
        {showComments && (
          <CommentSection postId={post.id} user={user} />
        )}
      </div>
    </motion.article>
  )
}