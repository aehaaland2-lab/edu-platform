import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabase"
import PostCard, {
  SUBJECTS,
  extractYouTubeId,
} from "../components/PostCard"
import { motion, AnimatePresence } from "framer-motion"

export default function Feed() {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("Общее")

  const [sections, setSections] = useState([
    {
      title: "",
      content: "",
    },
  ])

  const [user, setUser] = useState(null)

  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  // Состояния для вставки ссылок и видео в конкретную секцию
  const [activeTool, setActiveTool] = useState({
    index: null,
    type: null, // "link" | "youtube"
  })
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  // Поиск, фильтр по урокам и сортировка
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("Все")
  const [sortBy, setSortBy] = useState("newest") // "newest" | "oldest" | "subject"

  async function fetchPosts() {
    const { data, error } = await supabase
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

    if (error) {
      console.error(error)
      return
    }

    setPosts(data || [])
  }

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error(error)
      return
    }

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

    if (!user) return

    let imageUrl = null

    if (image) {
      const ext = image.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, image)

      if (uploadError) {
        console.error(uploadError)
        alert(uploadError.message)
        return
      }

      const { data } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName)

      imageUrl = data.publicUrl
    }

    // Пробуем сохранить с колонкой subject; если SQL еще не выполнен — сохраняем предмет в content как фоллбэк
    let post = null
    const { data: postWithSubject, error: subjectError } =
      await supabase
        .from("posts")
        .insert({
          title,
          subject,
          content: subject,
          user_email: user.email,
          user_id: user.id,
          image_url: imageUrl,
        })
        .select()
        .single()

    if (subjectError) {
      const { data: fallbackPost, error: fallbackError } =
        await supabase
          .from("posts")
          .insert({
            title,
            content: subject,
            user_email: user.email,
            user_id: user.id,
            image_url: imageUrl,
          })
          .select()
          .single()

      if (fallbackError) {
        console.error(fallbackError)
        alert(fallbackError.message)
        return
      }
      post = fallbackPost
    } else {
      post = postWithSubject
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
      alert(sectionsError.message)
      return
    }

    // Сброс формы
    setTitle("")
    setSubject("Общее")
    setSections([
      {
        title: "",
        content: "",
      },
    ])
    setImage(null)
    setImagePreview("")
    setActiveTool({ index: null, type: null })

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

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  function removeImage() {
    setImage(null)
    setImagePreview("")
  }

  function insertLinkIntoSection(index) {
    if (!linkUrl.trim()) return

    let formattedUrl = linkUrl.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl
    }

    const label = linkTitle.trim() || formattedUrl
    const markdownLink = `\n[${label}](${formattedUrl})\n`

    const copy = [...sections]
    copy[index].content =
      (copy[index].content || "").trimEnd() + markdownLink

    setSections(copy)
    setLinkTitle("")
    setLinkUrl("")
    setActiveTool({ index: null, type: null })
  }

  function insertVideoIntoSection(index) {
    if (!videoUrl.trim()) return

    const ytId = extractYouTubeId(videoUrl.trim())
    if (!ytId) {
      alert("Пожалуйста, вставьте корректную ссылку на YouTube видео")
      return
    }

    const copy = [...sections]
    const cleanUrl = `https://www.youtube.com/watch?v=${ytId}`
    copy[index].content =
      (copy[index].content || "").trimEnd() + `\n${cleanUrl}\n`

    setSections(copy)
    setVideoUrl("")
    setActiveTool({ index: null, type: null })
  }

  function removeSection(index) {
    if (sections.length <= 1) return
    setSections(sections.filter((_, i) => i !== index))
  }

  useEffect(() => {
    fetchPosts()
    loadProfile()
    fetchUser()
  }, [])

  // Определяем предмет поста (из колонки subject или фоллбэка content)
  function getPostSubject(post) {
    if (post.subject && SUBJECTS[post.subject]) {
      return post.subject
    }
    if (post.content && SUBJECTS[post.content]) {
      return post.content
    }
    return "Общее"
  }

  // Фильтрация и сортировка постов
  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return posts
      .filter((post) => {
        const postSubj = getPostSubject(post)

        if (
          selectedSubject !== "Все" &&
          postSubj !== selectedSubject
        ) {
          return false
        }

        if (!query) return true

        const inTitle = (post.title || "")
          .toLowerCase()
          .includes(query)
        const inSubject = postSubj
          .toLowerCase()
          .includes(query)
        const inAuthor = (post.profiles?.username || "")
          .toLowerCase()
          .includes(query)
        const inSections = (post.post_sections || []).some(
          (sec) =>
            (sec.title || "").toLowerCase().includes(query) ||
            (sec.content || "").toLowerCase().includes(query)
        )

        return inTitle || inSubject || inAuthor || inSections
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(a.created_at) - new Date(b.created_at)
          )
        }
        if (sortBy === "subject") {
          return getPostSubject(a).localeCompare(
            getPostSubject(b),
            "ru"
          )
        }
        return (
          new Date(b.created_at) - new Date(a.created_at)
        )
      })
  }, [posts, searchQuery, selectedSubject, sortBy])

  return (
    <>
      {/* WELCOME HEADER */}
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
        <div
          className="
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-yellow-300/25
            blur-[90px]
          "
        />

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
          <div className="rounded-2xl bg-white px-6 py-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Posts
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              {posts.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white px-6 py-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Level
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              1
            </h2>
          </div>

          <div className="rounded-2xl bg-yellow-50 px-6 py-5 border border-yellow-200">
            <p className="text-slate-500 text-sm font-medium">
              XP
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-950">
              0
            </h2>
          </div>
        </div>
      </motion.div>

      {/* CREATE POST CARD */}
      <div
        className="
          relative
          mb-8
          overflow-hidden
          rounded-[32px]
          border
          border-slate-200
          bg-gradient-to-br
          from-white
          via-white
          to-yellow-50
          p-6
          md:p-8
          shadow-[0_16px_50px_rgba(15,23,42,.07)]
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-24
            h-64
            w-64
            rounded-full
            bg-yellow-200/35
            blur-[80px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            -left-20
            h-56
            w-56
            rounded-full
            bg-sky-100/50
            blur-[80px]
          "
        />

        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-4
            mb-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
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

        {/* ВЫБОР УРОКА / ПРЕДМЕТА */}
        <div className="relative z-10 mb-6">
          <p className="mb-3 text-sm font-bold text-slate-700">
            Выберите предмет (урок):
          </p>

          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECTS).map(([name, meta]) => {
              const active = subject === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSubject(name)}
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    transition-all
                    duration-200
                    ${
                      active
                        ? "border-yellow-400 bg-yellow-400 text-slate-950 shadow-sm scale-[1.02]"
                        : "border-slate-200 bg-white text-slate-600 hover:border-yellow-300 hover:bg-yellow-50"
                    }
                  `}
                >
                  <span>{meta.icon}</span>
                  <span>{name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title..."
          className="
            w-full
            rounded-2xl
            border-2
            border-slate-200
            bg-white
            px-6
            py-4
            mb-6
            text-2xl
            font-bold
            text-slate-950
            placeholder:text-slate-400
            outline-none
            shadow-[0_8px_30px_rgba(15,23,42,.06)]
            transition-all
            duration-200
            focus:border-yellow-300
            focus:ring-4
            focus:ring-yellow-100
            focus:shadow-[0_10px_35px_rgba(234,179,8,.12)]
          "
        />

        {/* СЕКЦИИ ПОСТА */}
        <div className="mt-5 space-y-4">
          {sections.map((section, index) => {
            // Находим все YouTube видео, которые уже вставлены в текст этой секции, для живого превью
            const youtubeIds = [
              ...new Set(
                (section.content || "")
                  .split(/\s+/)
                  .map((word) => extractYouTubeId(word))
                  .filter(Boolean)
              ),
            ]

            return (
              <div
                key={index}
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-gradient-to-br
                  from-slate-50
                  via-white
                  to-amber-50/40
                  p-6
                  shadow-sm
                "
              >
                <div className="mb-4 flex items-center justify-between gap-3">
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
                      text-slate-950
                      placeholder:text-slate-400
                    "
                  />

                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="
                        shrink-0
                        rounded-xl
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-slate-400
                        transition
                        hover:bg-red-50
                        hover:text-red-500
                      "
                    >
                      ✕ Удалить
                    </button>
                  )}
                </div>

                <textarea
                  value={section.content}
                  onChange={(e) => {
                    const copy = [...sections]
                    copy[index].content = e.target.value
                    setSections(copy)
                  }}
                  rows={5}
                  placeholder="Пишите текст урока... Вы можете вставить ссылку на Wikipedia или YouTube прямо сюда или использовать кнопки ниже"
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-4
                    py-3
                    outline-none
                    text-[15px]
                    leading-7
                    text-slate-800
                    font-medium
                    placeholder:text-slate-400
                    transition
                    focus:border-yellow-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-yellow-100
                  "
                />

                {/* ПАНЕЛЬ ВСТАВКИ ССЫЛКИ И YOUTUBE (КАК В NOTION) */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool(
                        activeTool.index === index &&
                          activeTool.type === "link"
                          ? { index: null, type: null }
                          : { index, type: "link" }
                      )
                      setLinkTitle("")
                      setLinkUrl("")
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3.5
                      py-2
                      text-xs
                      font-bold
                      text-slate-700
                      shadow-sm
                      transition
                      hover:border-yellow-300
                      hover:bg-yellow-50
                    "
                  >
                    🔗 Добавить ссылку (Wikipedia и др.)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTool(
                        activeTool.index === index &&
                          activeTool.type === "youtube"
                          ? { index: null, type: null }
                          : { index, type: "youtube" }
                      )
                      setVideoUrl("")
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50/70
                      px-3.5
                      py-2
                      text-xs
                      font-bold
                      text-red-600
                      shadow-sm
                      transition
                      hover:bg-red-100
                    "
                  >
                    🎬 Вставить YouTube видео
                  </button>
                </div>

                {/* ФОРМА ДОБАВЛЕНИЯ ССЫЛКИ */}
                {activeTool.index === index &&
                  activeTool.type === "link" && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Вставка ссылки в текст
                      </p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          value={linkTitle}
                          onChange={(e) =>
                            setLinkTitle(e.target.value)
                          }
                          placeholder="Название (напр. Википедия: Пифагор)"
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3.5
                            py-2.5
                            text-sm
                            text-slate-900
                            outline-none
                            focus:border-yellow-400
                            focus:bg-white
                          "
                        />

                        <input
                          value={linkUrl}
                          onChange={(e) =>
                            setLinkUrl(e.target.value)
                          }
                          placeholder="https://ru.wikipedia.org/..."
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3.5
                            py-2.5
                            text-sm
                            text-slate-900
                            outline-none
                            focus:border-yellow-400
                            focus:bg-white
                          "
                        />
                      </div>

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTool({
                              index: null,
                              type: null,
                            })
                          }
                          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                        >
                          Отмена
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            insertLinkIntoSection(index)
                          }
                          className="rounded-xl bg-yellow-400 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-yellow-300"
                        >
                          Вставить ссылку
                        </button>
                      </div>
                    </div>
                  )}

                {/* ФОРМА ВСТАВКИ YOUTUBE ВИДЕО */}
                {activeTool.index === index &&
                  activeTool.type === "youtube" && (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-white p-4 shadow-sm">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                        YouTube плеер прямо в тексте (как в Notion)
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={videoUrl}
                          onChange={(e) =>
                            setVideoUrl(e.target.value)
                          }
                          placeholder="Вставьте ссылку: https://www.youtube.com/watch?v=..."
                          className="
                            flex-1
                            rounded-xl
                            border
                            border-slate-200
                            bg-slate-50
                            px-3.5
                            py-2.5
                            text-sm
                            text-slate-900
                            outline-none
                            focus:border-red-400
                            focus:bg-white
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            insertVideoIntoSection(index)
                          }
                          className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-600"
                        >
                          Встроить видео
                        </button>
                      </div>
                    </div>
                  )}

                {/* ЖИВОЕ ПРЕВЬЮ YOUTUBE В РЕДАКТОРЕ */}
                {youtubeIds.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Предпросмотр встроенного видео:
                    </p>
                    {youtubeIds.map((ytId) => (
                      <div
                        key={ytId}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-black aspect-video max-h-[340px] w-full"
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title="YouTube video preview"
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* IMAGE */}
        <div className="mt-6">
          <label
            className="
              inline-flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-yellow-300
              bg-yellow-50
              px-5
              py-3
              font-semibold
              text-yellow-700
              transition
              hover:-translate-y-0.5
              hover:bg-yellow-100
            "
          >
            📷 Add photo

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>

          {imagePreview && (
            <div
              className="
                relative
                mt-4
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-slate-100
              "
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-[450px] w-full object-cover"
              />

              <button
                type="button"
                onClick={removeImage}
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  bg-black/70
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur
                  transition
                  hover:bg-black/90
                "
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
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
              rounded-xl
              border
              border-yellow-300
              bg-yellow-50
              px-5
              py-3
              font-semibold
              text-yellow-700
              transition
              hover:-translate-y-0.5
              hover:bg-yellow-100
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
              rounded-2xl
              bg-gradient-to-r
              from-yellow-400
              to-amber-400
              px-10
              py-3.5
              font-bold
              text-amber-950
              transition-all
              duration-300
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            Publish
          </motion.button>
        </div>
      </div>

      {/* ПАНЕЛЬ ПОИСКА И ФИЛЬТРАЦИИ ПО УРОКАМ */}
      <div
        className="
          mb-6
          rounded-[28px]
          border
          border-slate-200
          bg-white
          p-6
          shadow-[0_12px_40px_rgba(15,23,42,.05)]
        "
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Строка поиска */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </span>

            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по постам, темам, тексту или автору..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                py-3.5
                pl-12
                pr-10
                text-sm
                font-medium
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-yellow-400
                focus:bg-white
                focus:ring-4
                focus:ring-yellow-100
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-full
                  px-2
                  py-1
                  text-xs
                  font-bold
                  text-slate-400
                  hover:bg-slate-200
                  hover:text-slate-700
                "
              >
                ✕
              </button>
            )}
          </div>

          {/* Сортировка */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Сортировка:
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3.5
                text-sm
                font-bold
                text-slate-700
                outline-none
                transition
                focus:border-yellow-400
                focus:bg-white
              "
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="subject">По предметам (А–Я)</option>
            </select>
          </div>
        </div>

        {/* Фильтр по урокам (предметам) */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedSubject("Все")}
            className={`
              rounded-xl
              border
              px-4
              py-2
              text-xs
              font-bold
              transition
              ${
                selectedSubject === "Все"
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            Все уроки ({posts.length})
          </button>

          {Object.entries(SUBJECTS).map(([name, meta]) => {
            const count = posts.filter(
              (p) => getPostSubject(p) === name
            ).length
            const active = selectedSubject === name

            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedSubject(name)}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  border
                  px-3.5
                  py-2
                  text-xs
                  font-bold
                  transition
                  ${
                    active
                      ? "border-yellow-400 bg-yellow-400 text-slate-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-yellow-300 hover:bg-yellow-50"
                  }
                `}
              >
                <span>{meta.icon}</span>
                <span>{name}</span>
                {count > 0 && (
                  <span
                    className={`
                      ml-1
                      rounded-full
                      px-1.5
                      py-0.5
                      text-[10px]
                      ${
                        active
                          ? "bg-white/60 text-slate-900"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* СПИСОК ПОСТОВ */}
      <motion.div layout className="mt-5 space-y-4 pb-20">
        {filteredPosts.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="text-5xl">🔍</div>
            <h3 className="mt-4 text-xl font-black text-slate-900">
              Посты не найдены
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Попробуйте изменить поисковый запрос или выбрать другой предмет.
            </p>
            {(searchQuery || selectedSubject !== "Все") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedSubject("Все")
                }}
                className="mt-5 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-yellow-300"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                deletePost={deletePost}
                user={user}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </>
  )
}