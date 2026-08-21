import { motion } from "framer-motion"
import { useState } from "react"
import { supabase } from "../supabase"

export default function Auth() {
  const [loading, setLoading] = useState(false)

  async function signInWithGoogle() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F4F7FA] flex items-center justify-center text-slate-900">

      {/* Soft background atmosphere */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-yellow-300/20 blur-[170px]"
      />

      <motion.div
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-sky-200/25 blur-[170px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="
          relative
          w-[430px]
          rounded-[34px]
          border
          border-slate-200
          bg-white
          p-9
          shadow-[0_30px_80px_rgba(15,23,42,0.10)]
        "
      >

        {/* Accent glow */}
        <div className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-yellow-300/20
          blur-[80px]
        " />

        <div className="relative">

          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black tracking-tight">
              EDU<span className="text-yellow-500">.</span>
            </h1>

            <span className="
              rounded-full
              border
              border-yellow-300
              bg-yellow-50
              px-3
              py-1
              text-xs
              font-semibold
              text-yellow-700
            ">
              LEARN • GROW • LEAD
            </span>
          </div>

          <p className="mt-3 text-slate-500">
            Learn. Inspire. Grow.
          </p>

          <div className="mt-12">

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              onClick={signInWithGoogle}
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white
                py-4
                font-bold
                text-slate-800
                shadow-sm
                transition-all
                duration-300
                hover:border-yellow-300
                hover:bg-yellow-50
                hover:shadow-[0_12px_30px_rgba(234,179,8,0.12)]
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-60
              "
            >

              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-6 h-6"
              />

              {loading ? "Connecting..." : "Continue with Google"}

            </motion.button>

          </div>

          <p className="text-center text-slate-400 mt-8 text-sm">
            Continue securely with your Google account.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              YOUR LEARNING SPACE
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

        </div>

      </motion.div>

    </div>
  )
}