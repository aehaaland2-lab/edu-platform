import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "../supabase"

export default function Auth() {
  const navigate = useNavigate()

  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function signUp() {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        role: "student",
        xp: 0,
      })

      if (profileError) {
        alert(profileError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    navigate("/")
  }

  async function signIn() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate("/")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090B] flex items-center justify-center text-white">
      <motion.div
        animate={{x:[0,40,0],y:[0,30,0]}}
        transition={{duration:10,repeat:Infinity,ease:"easeInOut"}}
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-yellow-400/10 blur-[170px]"
      />

      <motion.div
        animate={{x:[0,-40,0],y:[0,-30,0]}}
        transition={{duration:12,repeat:Infinity,ease:"easeInOut"}}
        className="absolute -right-40 -bottom-40 h-[520px] w-[520px] rounded-full bg-violet-600/10 blur-[170px]"
      />

      <motion.div
        initial={{opacity:0,y:25,scale:.96}}
        animate={{opacity:1,y:0,scale:1}}
        transition={{duration:.5}}
        className="relative w-[430px] rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-2xl"
      >
        <h1 className="text-4xl font-black">EDU<span className="text-yellow-400">.</span></h1>
        <p className="mt-2 text-slate-400">Learn. Inspire. Grow.</p>

        <div className="mt-8 flex rounded-2xl bg-white/5 p-1">
          <button
            onClick={()=>setMode("login")}
            className={`flex-1 rounded-xl py-3 transition ${mode==="login"?"bg-yellow-400 text-black font-bold":"text-slate-300"}`}>
            Sign In
          </button>

          <button
            onClick={()=>setMode("register")}
            className={`flex-1 rounded-xl py-3 transition ${mode==="register"?"bg-yellow-400 text-black font-bold":"text-slate-300"}`}>
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{opacity:0,y:10}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-10}}
            className="mt-8 space-y-4"
          >
            {mode==="register" && (
              <input
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none focus:border-yellow-400"
              />
            )}

            <input
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 outline-none focus:border-yellow-400"
            />

            <div className="relative">
              <input
                type={showPassword?"text":"password"}
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-white/10 bg-black/30 p-4 pr-16 outline-none focus:border-yellow-400"
              />

              <button
                type="button"
                onClick={()=>setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword?"🙈":"👁️"}
              </button>
            </div>

            <motion.button
              whileHover={{scale:1.02}}
              whileTap={{scale:.98}}
              disabled={loading}
              onClick={mode==="login"?signIn:signUp}
              className="w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-bold text-black"
            >
              {loading?"Loading...":mode==="login"?"Sign In":"Create Account"}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
