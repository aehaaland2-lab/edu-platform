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
    <div className="relative min-h-screen overflow-hidden bg-[#09090B] flex items-center justify-center text-white">

      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-[170px]"
      />

      <motion.div
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[170px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 25, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5 }}
        className="relative w-[430px] rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl"
      >

        <h1 className="text-4xl font-black">
          EDU<span className="text-yellow-400">.</span>
        </h1>

        <p className="mt-2 text-slate-400">
          Learn. Inspire. Grow.
        </p>

        <div className="mt-12">

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: .98 }}
            disabled={loading}
            onClick={signInWithGoogle}
            className="w-full rounded-2xl bg-white text-black py-4 font-bold flex items-center justify-center gap-3"
          >

            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-6 h-6"
            />

            {loading ? "Connecting..." : "Continue with Google"}

          </motion.button>

        </div>

        <p className="text-center text-slate-500 mt-8 text-sm">
          Continue securely with your Google account.
        </p>

      </motion.div>

    </div>
  )
}