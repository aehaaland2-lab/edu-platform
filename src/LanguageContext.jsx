import { createContext, useContext, useState, useEffect } from "react"

const LanguageContext = createContext()

// Единый справочник уроков с ключами и переводами на RU и EN
export const SUBJECT_KEYS = {
  algebra: {
    icon: "➗",
    ru: "Алгебра",
    en: "Algebra",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  math: {
    icon: "📐",
    ru: "Математика",
    en: "Mathematics",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
  },
  geography: {
    icon: "🌍",
    ru: "География",
    en: "Geography",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  physics: {
    icon: "⚛️",
    ru: "Физика",
    en: "Physics",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
  },
  cs: {
    icon: "💻",
    ru: "Информатика",
    en: "Computer Science",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  chemistry: {
    icon: "🧪",
    ru: "Химия",
    en: "Chemistry",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
  biology: {
    icon: "🧬",
    ru: "Биология",
    en: "Biology",
    badge: "border-green-200 bg-green-50 text-green-700",
  },
  history: {
    icon: "🏛️",
    ru: "История",
    en: "History",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
  },
  english: {
    icon: "🇬🇧",
    ru: "Английский",
    en: "English",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  literature: {
    icon: "📚",
    ru: "Литература",
    en: "Literature",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
  },
  general: {
    icon: "✨",
    ru: "Общее",
    en: "General",
    badge: "border-slate-200 bg-slate-100 text-slate-700",
  },
}

// Распознает предмет поста (даже если он был сохранен по-русски или по-английски ранее)
export function normalizeSubjectKey(raw) {
  if (!raw) return "general"
  const clean = raw.trim().toLowerCase()

  if (SUBJECT_KEYS[clean]) return clean

  for (const [key, val] of Object.entries(SUBJECT_KEYS)) {
    if (
      val.ru.toLowerCase() === clean ||
      val.en.toLowerCase() === clean
    ) {
      return key
    }
  }
  return "general"
}

const translations = {
  ru: {
    // Layout & Navigation
    tagline: "Учись. Расти. Лидируй.",
    signedInAs: "Вы вошли как",
    navFeed: "Лента",
    navTests: "Тесты",
    navLeaderboard: "Лидерборд",
    navMessages: "Сообщения",
    navProfile: "Профиль",
    logout: "Выйти",
    langLabel: "Язык окружения",

    // Feed
    welcomeBack: "С возвращением",
    heroSubtitle: "Вдохновляйте учеников. Делитесь знаниями. Создавайте будущее.",
    postsCount: "Постов",
    level: "Уровень",
    xp: "Опыт (XP)",
    community: "Сообщество",
    createNewPost: "Создать новый пост",
    publicBadge: "Публичный",
    chooseSubject: "Выберите предмет (урок):",
    postTitlePlaceholder: "Заголовок поста...",
    sectionTitlePlaceholder: (i) => `Заголовок секции ${i}`,
    sectionContentPlaceholder:
      "Пишите текст урока... Вы можете вставить ссылку на Wikipedia или YouTube прямо сюда или использовать кнопки ниже",
    deleteBtn: "Удалить",
    addLinkBtn: "🔗 Добавить ссылку (Wikipedia и др.)",
    addYoutubeBtn: "🎬 Вставить YouTube видео",
    insertLinkHeader: "Вставка ссылки в текст",
    linkTitlePlaceholder: "Название (напр. Википедия: Теорема Виета)",
    linkUrlPlaceholder: "https://ru.wikipedia.org/...",
    cancel: "Отмена",
    insertLinkSubmit: "Вставить ссылку",
    youtubeHeader: "YouTube плеер прямо в тексте (как в Notion)",
    youtubePlaceholder: "Вставьте ссылку: https://www.youtube.com/watch?v=...",
    embedVideoSubmit: "Встроить видео",
    invalidYoutubeAlert: "Пожалуйста, вставьте корректную ссылку на YouTube видео",
    videoPreviewLabel: "Предпросмотр встроенного видео:",
    addPhoto: "📷 Добавить фото",
    removePhoto: "Убрать",
    addSection: "+ Добавить секцию",
    publish: "Опубликовать",
    searchPostsPlaceholder: "Поиск по постам, предметам, тексту или автору...",
    sortByLabel: "Сортировка:",
    sortNewest: "Сначала новые",
    sortOldest: "Сначала старые",
    sortSubject: "По предметам (А–Я)",
    allSubjects: "Все уроки",
    noPostsFound: "Посты не найдены",
    noPostsHint: "Попробуйте изменить поисковый запрос или выбрать другой предмет.",
    resetFilters: "Сбросить фильтры",

    // PostCard & Comments
    unknownUser: "Неизвестный пользователь",
    unknownRole: "Роль не указана",
    sectionDefault: (i) => `Секция ${i}`,
    commentBtn: "💬 Комментарии",
    saveBtn: "🔖 Сохранить",
    noCommentsYet: "Комментариев пока нет",
    beFirstComment: "Будьте первым, кто поделится мнением.",
    writeCommentPlaceholder: "Напишите комментарий...",
    sending: "Отправка...",
    sendComment: "Отправить комментарий",

    // Tests
    testsTitle: "Тесты",
    testsSubtitle: "Просматривайте папки и проходите тесты по предметам.",
    backBtn: "← Назад",
    newTestBtn: "+ Новый тест",
    newFolderTitle: "Новая папка",
    folderNamePlaceholder: "Название папки",
    createBtn: "Создать",
    titlePlaceholder: "Название теста",
    descPlaceholder: "Описание теста",
    timeLimitLabel: "⏱ Лимит времени (минуты)",
    xpRewardLabel: "⭐ Награда XP",
    openFolder: "Открыть папку",
    noDescription: "Без описания",
    minShort: "мин",

    // Leaderboard
    leaderboardTitle: "Таблица лидеров",
    leaderboardSubtitle: "Лучшие ученики по количеству XP.",
    searchStudentsPlaceholder: "Поиск учеников...",
    loadingLeaderboard: "Загрузка рейтинга...",
    noStudentsFound: "Ученики не найдены.",
    topStudent: "1 место",
    secondPlace: "2 место",
    thirdPlace: "3 место",

    // Messages
    messagesTitle: "Сообщения",
    messagesSubtitle: "Общайтесь со всеми участниками сообщества EDU.",
    mentionsReplies: "Упоминания и ответы",
    peopleReachedOut: "Люди, которые обратились к вам",
    noMentions: "Нет упоминаний или ответов",
    allCaughtUp: "Вы всё просмотрели.",
    mentionedYou: "Упомянул(а) вас",
    repliedToYou: "Ответил(а) вам",
    noMessagesYet: "Сообщений пока нет",
    beFirstMessage: "Напишите первым в общий чат.",
    replyingTo: "Ответ пользователю",
    replyBtn: "Ответить",
    mentionSomeone: "Упомянуть пользователя",
    mentionThisUser: "Выбрать пользователя",
    writeReplyPlaceholder: "Напишите ответ...",
    writeMessagePlaceholder: "Напишите сообщение... Используйте @username для упоминания",
    sendBtn: "Отправить",
    chatFooterHint: "Enter — отправить · Shift + Enter — новая строка · @username — упомянуть",

    // Profile
    loadingProfile: "Загрузка профиля...",
    editProfileBtn: "Редактировать профиль",
    completedTests: "Пройдено тестов",
    bestScore: "Лучший результат",
    createdTests: "Создано тестов",
    totalAttempts: "Всего попыток",
    averageScore: "Средний балл",
    studentsCount: "Учеников",
    totalXpGiven: "Выдано XP",
    avgStudentScore: "Средний балл учеников",
    progressLabel: "Прогресс",
    recentTests: "Недавние тесты",
    completedCount: "завершено",
    noTestsCompleted: "Нет пройденных тестов",
    noTestsCompletedDesc: "Пройдите свой первый тест, чтобы увидеть результаты здесь.",
    testItemTitle: "Тест",
    teacherLabel: "Преподаватель",
    publishedPosts: "Опубликованные посты",
    noPostsYet: "Постов пока нет",
    noPostsYetDesc: "Опубликованные посты появятся здесь.",
  },

  en: {
    // Layout & Navigation
    tagline: "Learn. Grow. Lead.",
    signedInAs: "Signed in as",
    navFeed: "Feed",
    navTests: "Tests",
    navLeaderboard: "Leaderboard",
    navMessages: "Messages",
    navProfile: "Profile",
    logout: "Log out",
    langLabel: "Language",

    // Feed
    welcomeBack: "Welcome Back",
    heroSubtitle: "Inspire students. Share knowledge. Build the future.",
    postsCount: "Posts",
    level: "Level",
    xp: "XP",
    community: "Community",
    createNewPost: "Create a new post",
    publicBadge: "Public",
    chooseSubject: "Choose subject (lesson):",
    postTitlePlaceholder: "Post title...",
    sectionTitlePlaceholder: (i) => `Section ${i} title`,
    sectionContentPlaceholder:
      "Write lesson content... Paste any Wikipedia or YouTube link directly here or use the buttons below",
    deleteBtn: "Delete",
    addLinkBtn: "🔗 Add link (Wikipedia, etc.)",
    addYoutubeBtn: "🎬 Embed YouTube video",
    insertLinkHeader: "Insert link into text",
    linkTitlePlaceholder: "Title (e.g. Wikipedia: Quadratic Formula)",
    linkUrlPlaceholder: "https://en.wikipedia.org/...",
    cancel: "Cancel",
    insertLinkSubmit: "Insert Link",
    youtubeHeader: "Inline YouTube player (Notion style)",
    youtubePlaceholder: "Paste link: https://www.youtube.com/watch?v=...",
    embedVideoSubmit: "Embed Video",
    invalidYoutubeAlert: "Please paste a valid YouTube video URL",
    videoPreviewLabel: "Embedded video preview:",
    addPhoto: "📷 Add photo",
    removePhoto: "Remove",
    addSection: "+ Add section",
    publish: "Publish",
    searchPostsPlaceholder: "Search posts, subjects, content, or author...",
    sortByLabel: "Sort by:",
    sortNewest: "Newest first",
    sortOldest: "Oldest first",
    sortSubject: "By subject (A–Z)",
    allSubjects: "All subjects",
    noPostsFound: "No posts found",
    noPostsHint: "Try changing your search query or selecting another subject.",
    resetFilters: "Reset filters",

    // PostCard & Comments
    unknownUser: "Unknown User",
    unknownRole: "Unknown Role",
    sectionDefault: (i) => `Section ${i}`,
    commentBtn: "💬 Comment",
    saveBtn: "🔖 Save",
    noCommentsYet: "No comments yet",
    beFirstComment: "Be the first to share your thoughts.",
    writeCommentPlaceholder: "Write a comment...",
    sending: "Sending...",
    sendComment: "Send Comment",

    // Tests
    testsTitle: "Tests",
    testsSubtitle: "Browse folders and take subject tests.",
    backBtn: "← Back",
    newTestBtn: "+ New Test",
    newFolderTitle: "New Folder",
    folderNamePlaceholder: "Folder name",
    createBtn: "Create",
    titlePlaceholder: "Title",
    descPlaceholder: "Description",
    timeLimitLabel: "⏱ Time Limit (minutes)",
    xpRewardLabel: "⭐ XP Reward",
    openFolder: "Open folder",
    noDescription: "No description",
    minShort: "min",

    // Leaderboard
    leaderboardTitle: "Leaderboard",
    leaderboardSubtitle: "Top students ranked by XP.",
    searchStudentsPlaceholder: "Search students...",
    loadingLeaderboard: "Loading leaderboard...",
    noStudentsFound: "No students found.",
    topStudent: "Top student",
    secondPlace: "