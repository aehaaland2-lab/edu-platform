import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function TestCard({ test, profile }) {
    const navigate = useNavigate()

  return (

    <motion.div

      whileHover={{
        y:-5,
        scale:1.01,
      }}

      whileTap={{
        scale:.98,
      }}
      
        onClick={() =>
  navigate(
    profile?.role === "teacher"
      ? `/test/editor/${test.id}`
      : `/test/play/${test.id}`
  )
}
      className="
      rounded-3xl
      border
      border-white/10
      bg-gradient-to-br
      from-indigo-500/10
      to-violet-500/10
      p-8
      cursor-pointer
      "

    >

      <div className="text-6xl">

        📝

      </div>

      <h2 className="mt-6 text-2xl font-black">

        {test.title}

      </h2>

      <p className="mt-3 text-slate-400">

        {test.description || "No description"}

      </p>

      <div className="mt-5 flex gap-3 text-sm">

        <div className="rounded-xl bg-white/10 px-3 py-2">

          ⏱ {test.time_limit} min

        </div>

        <div className="rounded-xl bg-yellow-400/20 px-3 py-2 text-yellow-300">

          ⭐ {test.xp_reward} XP

        </div>

      </div>

    </motion.div>

  )

}