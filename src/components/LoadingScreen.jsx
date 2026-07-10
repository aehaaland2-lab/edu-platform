import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let value = 0

    const interval = setInterval(() => {
      value += Math.floor(Math.random() * 5) + 1

      if (value >= 100) {
        value = 100
        clearInterval(interval)
      }

      setProgress(value)
    }, 30)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#09090B]"
    >
      <div
        className="
        absolute
        h-[600px]
        w-[600px]
        rounded-full
        bg-yellow-400/5
        blur-[180px]
        "
      />
      <svg
        className="absolute h-[420px] w-[420px]"
        viewBox="0 0 420 420"
      >

        <motion.circle
          cx="210"
          cy="210"
          r="165"
          fill="none"
          stroke="#FACC15"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="420 700"
          style={{
            filter: "drop-shadow(0 0 10px rgba(250,204,21,.9))",
            transformOrigin: "50% 50%",
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.circle
          cx="210"
          cy="210"
          r="135"
          fill="none"
          stroke="white"
          strokeOpacity=".75"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="260 600"
          style={{
            filter: "drop-shadow(0 0 8px rgba(255,255,255,.25))",
            transformOrigin: "50% 50%",
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

      </svg>

      {/* Центр */}
      <div className="relative z-10 flex flex-col items-center">

        <h1 className="text-5xl font-black tracking-[0.35em] text-white">
          EDU
        </h1>

        <motion.p
          key={progress}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="
          mt-2
          text-6xl
          font-black
          tracking-widest
          text-white
          drop-shadow-[0_0_18px_rgba(250,204,21,.45)]
          "
        >
          {progress}%
        </motion.p>

        <p className="
          mt-8
          text-[11px]
          tracking-[0.7em]
          text-yellow-400/70
          uppercase
          ">
          SYNCING DATA
        </p>

      </div>
    </motion.div>
  )
}