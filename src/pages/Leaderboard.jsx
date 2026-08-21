import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { motion } from "framer-motion"

export default function Leaderboard() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, xp")
      .order("xp", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) =>
    (user.username || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-20"
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-white/10
          bg-gradient-to-br
          from-[#171A22]
          via-[#12141B]
          to-[#0B0C10]
          p-10
          mb-8
          shadow-[0_40px_120px_rgba(0,0,0,.45)]
        "
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-[120px]" />

        <p className="relative z-10 text-yellow-400 uppercase tracking-[0.35em] text-sm">
          Community
        </p>

        <h1 className="relative z-10 mt-3 text-5xl font-black">
          Leaderboard
        </h1>

        <p className="relative z-10 mt-3 text-slate-400 text-lg">
          Top students ranked by XP.
        </p>

        <div className="relative z-10 mt-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Search students..."
            className="
              w-full
              rounded-2xl
              border
              border-white/10
              bg-[#0F1117]
              px-6
              py-4
              text-lg
              outline-none
              transition-all
              duration-300
              focus:border-yellow-400
            "
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-slate-400 py-10">
            Loading leaderboard...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center text-slate-400 py-10">
            No students found.
          </div>
        ) : (
          filteredUsers.map((profile) => {
            const rank = users.findIndex(
              (user) => user.id === profile.id
            ) + 1

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  flex
                  items-center
                  gap-5
                  rounded-2xl
                  border
                  border-white/10
                  bg-gradient-to-r
                  from-[#16181F]
                  to-[#0D0F13]
                  px-6
                  py-5
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-yellow-400/30
                "
              >
                <div className="w-12 text-center text-xl font-black text-slate-400">
                  {rank <= 3
                    ? ["🥇", "🥈", "🥉"][rank - 1]
                    : rank}
                </div>

                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      👤
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {profile.username || "Unknown User"}
                  </p>
                </div>

                <div className="text-yellow-400 font-black">
                  {profile.xp ?? 0} XP
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}