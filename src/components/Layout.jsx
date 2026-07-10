// Layout.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function Layout({ user, logout, children }) {
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    document.body.style.background = "#09090B"
  }, [])

  const navItems = [
    { to: "/", label: "🏠 Feed" },
    { to: "/tests", label: "📚 Tests" },
    { to: "/messages", label: "💬 Messages" },
    { to: `/profile/${user?.id}`, label: "👤 Profile" },
  ]

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <button onClick={() => setMobileMenu(v=>!v)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-white/10 bg-[#0F1117] px-4 py-3">
        ☰
      </button>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: mobileMenu ? 0 : -320
        }}
        transition={{
          duration: 0.25
        }}
        className="
          fixed
          left-0
          top-0
          z-50
          h-screen
          w-72
          bg-[#0F1117]/95
          backdrop-blur-2xl
          border-r
          border-white/10
          flex
          flex-col
          p-6
          lg:translate-x-0
        "
      >
        <h1 className="text-3xl font-black">EDU<span className="text-yellow-400">.</span></h1>
        <div className="mt-8 rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p>{user?.email}</p>
        </div>
        <nav className="mt-8 space-y-2">
          {navItems.map(item=>(
            <Link key={item.to} to={item.to} onClick={()=>setMobileMenu(false)} className="block rounded-xl px-4 py-3 hover:bg-white/10">
              {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="mt-auto rounded-xl bg-red-500/10 py-3">Logout</button>
      </motion.aside>

      <main className="p-4 pt-20 lg:ml-72 lg:p-10">
        {children}
      </main>
    </div>
  )
}
