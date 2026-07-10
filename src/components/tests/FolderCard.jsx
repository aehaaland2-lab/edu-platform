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
        scale: .98,
      }}

      onClick={() => open(folder)}

      className="
        cursor-pointer
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-8
        transition
      "
    >

      <div className="text-6xl">

        📁

      </div>

      <h2 className="mt-6 text-2xl font-black">

        {folder.name}

      </h2>

    </motion.div>

  )

}