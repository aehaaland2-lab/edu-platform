import { motion } from "framer-motion"

export default function Breadcrumbs({
  path,
  goTo,
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <motion.button
        whileHover={{
          scale: 1.03,
        }}
        onClick={() => goTo(null)}
        className="
          rounded-xl
          border
          border-yellow-200
          bg-yellow-50
          px-4
          py-2
          font-semibold
          text-yellow-700
          transition
          hover:bg-yellow-100
        "
      >
        Tests
      </motion.button>

      {path.map((folder) => (
        <div
          key={folder.id}
          className="flex items-center gap-2"
        >
          <span className="text-slate-300">
            /
          </span>

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            onClick={() => goTo(folder.id)}
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-slate-600
              transition
              hover:border-yellow-200
              hover:bg-yellow-50
              hover:text-yellow-700
            "
          >
            {folder.name}
          </motion.button>
        </div>
      ))}
    </div>
  )
}