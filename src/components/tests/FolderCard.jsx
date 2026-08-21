import { motion } from "framer-motion"

export default function FolderCard({
  folder,
  open,
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={() => open(folder)}
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
        📁
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-900">
        {folder.name}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Open folder
      </p>
    </motion.div>
  )
}