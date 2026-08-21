import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function TestCard({ test, profile }) {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() =>
        navigate(
          profile?.role === "teacher"
            ? `/test/editor/${test.id}`
            : `/test/play/${test.id}`
        )
      }
      className="
        group
        cursor-pointer
        rounded-[28px]
        border
        border-yellow-200
        bg-gradient-to-br
        from-white
        via-white
        to-yellow-50
        p-8
        shadow-[0_12px_35px_rgba(234,179,8,0.08)]
        transition-all
        duration-300
        hover:border-yellow-300
        hover:shadow-[0_20px_45px_rgba(234,179,8,0.14)]
      "
    >
      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-yellow-100
          text-4xl
          transition
          group-hover:bg-yellow-200
        "
      >
        📝
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-900">
        {test.title}
      </h2>

      <p className="mt-3 text-slate-500">
        {test.description || "No description"}
      </p>

      <div className="mt-6 flex gap-3 text-sm">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
          ⏱ {test.time_limit} min
        </div>

        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 font-semibold text-yellow-700">
          ⭐ {test.xp_reward} XP
        </div>
      </div>
    </motion.div>
  )
}