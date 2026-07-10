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
          bg-white/5
          px-4
          py-2
          text-slate-300
          transition
          hover:text-yellow-300
        "
      >
        Tests
      </motion.button>

      {path.map((folder, index) => (

        <div
          key={folder.id}
          className="flex items-center gap-2"
        >

          <span className="text-slate-600">
            /
          </span>

          <motion.button

            whileHover={{
              scale: 1.03,
            }}

            onClick={() => goTo(folder.id)}

            className="
              rounded-xl
              bg-white/5
              px-4
              py-2
              transition
              hover:text-yellow-300
            "
          >
            {folder.name}
          </motion.button>

        </div>

      ))}

    </div>

  )

}