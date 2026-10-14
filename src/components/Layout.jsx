import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "../LanguageContext"

export default function Layout({ user, logout, children }) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const location = useLocation()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    document.body.style.background = "#F5F7FA"
  }, [])

  const navItems = [
    { to: "/", icon: "⌂", label: t.navFeed },
    { to: "/tests", icon: "▣", label: t.navTests },
    { to: "/leaderboard", icon: "♛", label: t.navLeaderboard },
    { to: "/messages", icon: "✉", label: t.navMessages },
    { to: `/profile/${user?.id}`, icon: "◉", label: t.navProfile },
  ]

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033]">
      {/* ВЕРХНЯЯ ПАНЕЛЬ С ВЫБОРОМ ЯЗЫКА НА ВЕРХУШКЕ САЙТА */}
      <header
        className="
          sticky
          top-0
          z-40
          flex
          items-center
          justify-between
          border-b
          border-slate-200/80
          bg-white/85
          px-4
          py-3
          backdrop-blur-md
          lg:px-10
        "
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenu((v) => !v)}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-lg
              text-slate-700
              shadow-sm
              transition
              hover:border-yellow-300
              hover:shadow-md
            "
          >
            ☰
          </button>

          <Link
            to="/"
            className="text-2xl font-black tracking-tight text-[#172033]"
          >
            EDU<span className="text-yellow-500">.</span>
          </Link>
        </div>

        {/* ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА RU / EN */}
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-bold uppercase tracking-wider text-slate-400 sm:inline">
            {t.langLabel}:
          </span>

          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setLang("ru")}
              className={`
                flex
                items-center
                gap-1.5
                rounded-xl
                px-3.5
                py-1.5
                text-xs
                font-black
                transition-all
                ${
                  lang === "ru"
                    ? "bg-yellow-400 text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <span>🇷🇺</span>
              <span>RU</span>
            </button>

            <button
              type="button"
              onClick={() => setLang("en")}
              className={`
                flex
                items-center
                gap-1.5
                rounded-xl
                px-3.5
                py-1.5
                text-xs
                font-black
                transition-all
                ${
                  lang === "en"
                    ? "bg-yellow-400 text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }
              `}
            >
              <span>🇬🇧</span>
              <span>EN</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: mobileMenu ? 0 : "-100%",
        }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-slate-200
          bg-white
          p-6
          shadow-[10px_0_40px_rgba(15,23,42,0.08)]
        "
      >
        {/* Logo + Close */}
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#172033]">
              EDU<span className="text-yellow-500">.</span>
            </h1>

            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {t.tagline}
            </p>
          </div>

          <button
            onClick={() => setMobileMenu(false)}
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* User card */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-4">
          <p className="text-xs font-medium text-slate-400">
            {t.signedInAs}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {user?.email}
          </p>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/" &&
                location.pathname.startsWith(item.to))

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenu(false)}
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  px-4
                  py-3.5
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    active
                      ? "bg-yellow-50 text-yellow-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <span
                  className={`
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    text-lg
                    transition
                    ${
                      active
                        ? "bg-yellow-400 text-white shadow-sm"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                    }
                  `}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {active && (
                  <motion.span
                    layoutId="activeNav"
                    className="ml-auto h-2 w-2 rounded-full bg-yellow-400"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto">
          <div className="mb-5 h-px bg-slate-200" />

          <button
            onClick={logout}
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-2xl
              border
              border-red-100
              bg-red-50
              py-3.5
              text-sm
              font-semibold
              text-red-500
              transition
              hover:bg-red-100
              active:scale-[0.98]
            "
          >
            {t.logout}
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            EduPlatform
          </p>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="min-h-screen p-4 pt-8 lg:p-10">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  )
}