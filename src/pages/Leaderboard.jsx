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
      setLoading(false)
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
      {/* Header */}
      <div
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-slate-200
          bg-gradient-to-br
          from-white
          via-white
          to-amber-50
          p-10
          mb-8
          shadow-[0_25px_70px_rgba(15,23,42,.08)]
        "
      >
        <div
          className="
            absolute
            -right-24
            -top-24
            h-80
            w-80
            rounded-full
            bg-yellow-300/20
            blur-[100px]
          "
        />

        <div
          className="
            absolute
            -left-24
            -bottom-32
            h-64
            w-64
            rounded-full
            bg-blue-100/40
            blur-[100px]
          "
        />

        <div className="relative z-10">
          <p className="text-yellow-600 uppercase tracking-[0.35em] text-sm font-bold">
            Community
          </p>

          <h1 className="mt-3 text-5xl font-black tracking-tight text-slate-950">
            Leaderboard
          </h1>

          <p className="mt-3 text-slate-500 text-lg">
            Top students ranked by XP.
          </p>

          {/* Search */}
          <div className="relative mt-8">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg">
              🔎
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white/90
                px-6
                py-4
                pl-14
                text-lg
                text-slate-900
                placeholder:text-slate-400
                outline-none
                shadow-sm
                transition-all
                duration-300
                focus:border-yellow-400
                focus:ring-4
                focus:ring-yellow-400/10
              "
            />
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="space-y-3">
        {loading ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              py-10
              text-center
              text-slate-500
              shadow-sm
            "
          >
            Loading leaderboard...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              py-10
              text-center
              text-slate-500
              shadow-sm
            "
          >
            No students found.
          </div>
        ) : (
          filteredUsers.map((profile) => {
            const rank =
              users.findIndex((user) => user.id === profile.id) + 1

            const isFirst = rank === 1
            const isSecond = rank === 2
            const isThird = rank === 3

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className={`
                  group
                  flex
                  items-center
                  gap-5
                  rounded-2xl
                  border
                  px-6
                  py-5
                  transition-all
                  duration-300
                  shadow-sm
                  ${
                    isFirst
                      ? "border-yellow-300 bg-gradient-to-r from-yellow-50 via-white to-white shadow-yellow-100/60"
                      : isSecond
                        ? "border-slate-200 bg-gradient-to-r from-slate-50 via-white to-white"
                        : isThird
                          ? "border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-white"
                          : "border-slate-200 bg-white hover:border-yellow-300 hover:bg-yellow-50/30"
                  }
                `}
              >
                {/* Rank */}
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    text-xl
                    font-black
                    ${
                      isFirst
                        ? "bg-yellow-100 text-yellow-700"
                        : isSecond
                          ? "bg-slate-100 text-slate-600"
                          : isThird
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-50 text-slate-400"
                    }
                  `}
                >
                  {isFirst
                    ? "1"
                    : isSecond
                      ? "2"
                      : isThird
                        ? "3"
                        : rank}
                </div>

                {/* Avatar */}
                <div
                  className={`
                    h-12
                    w-12
                    shrink-0
                    overflow-hidden
                    rounded-full
                    ring-2
                    ${
                      isFirst
                        ? "ring-yellow-300"
                        : isSecond
                          ? "ring-slate-200"
                          : isThird
                            ? "ring-amber-200"
                            : "ring-slate-100"
                    }
                  `}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-yellow-300 to-amber-500 text-lg font-black text-white">
                      {(profile.username || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Username */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-slate-900">
                    {profile.username || "Unknown User"}
                  </p>

                  {rank <= 3 && (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {isFirst
                        ? "Top student"
                        : isSecond
                          ? "Second place"
                          : "Third place"}
                    </p>
                  )}
                </div>

                {/* XP */}
                <div
                  className={`
                    shrink-0
                    text-lg
                    font-black
                    ${
                      rank <= 3
                        ? "text-yellow-600"
                        : "text-slate-700"
                    }
                  `}
                >
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