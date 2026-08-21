import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [attempts, setAttempts] = useState([])
  const [createdTests, setCreatedTests] = useState([])
  const [teacherAttempts, setTeacherAttempts] = useState([])

  useEffect(() => {
    load()
  }, [id])

  const level = Math.floor((profile?.xp || 0) / 100) + 1

  const averageScore = useMemo(() => {
    if (!attempts.length) return 0

    return Math.round(
      attempts.reduce(
        (sum, item) => sum + (item.score / item.total) * 100,
        0
      ) / attempts.length
    )
  }, [attempts])

  const bestScore = useMemo(() => {
    if (!attempts.length) return 0

    return Math.max(
      ...attempts.map(
        (item) => Math.round((item.score / item.total) * 100)
      )
    )
  }, [attempts])

  const teacherAverage = useMemo(() => {
    if (!teacherAttempts.length) return 0

    return Math.round(
      teacherAttempts.reduce(
        (sum, item) => sum + (item.score / item.total) * 100,
        0
      ) / teacherAttempts.length
    )
  }, [teacherAttempts])

  const uniqueStudents = useMemo(() => {
    return new Set(
      teacherAttempts.map((item) => item.user_id)
    ).size
  }, [teacherAttempts])

  const totalTeacherXp = useMemo(() => {
    return teacherAttempts.reduce(
      (sum, item) => sum + (item.xp || 0),
      0
    )
  }, [teacherAttempts])

  async function load() {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()

    setProfile(profileData)

    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })

    setPosts(postsData || [])

    if (profileData?.role === "student") {
      const { data } = await supabase
        .from("test_attempts")
        .select(`
          score,
          total,
          xp,
          user_id,
          test_id,
          tests(title)
        `)
        .eq("user_id", id)
        .order("created_at", { ascending: false })

      setAttempts(data || [])
    }

    if (profileData?.role === "teacher") {
      const { data: tests } = await supabase
        .from("tests")
        .select("*")
        .eq("created_by", id)
        .order("created_at", { ascending: false })

      setCreatedTests(tests || [])

      if (tests?.length) {
        const ids = tests.map((test) => test.id)

        const { data: allAttempts } = await supabase
          .from("test_attempts")
          .select(`
            score,
            total,
            user_id,
            test_id,
            xp
          `)
          .in("test_id", ids)

        setTeacherAttempts(allAttempts || [])
      }
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading...
      </div>
    )
  }

  const statCard = `
    rounded-[24px]
    border
    border-slate-200
    bg-white
    p-6
    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
  `

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          overflow-hidden
          rounded-[36px]
          border
          border-yellow-200
          bg-gradient-to-br
          from-white
          via-white
          to-yellow-50
          shadow-[0_20px_60px_rgba(234,179,8,0.08)]
        "
      >
        {/* Cover */}
        <div
          className="
            relative
            h-52
            overflow-hidden
            bg-gradient-to-r
            from-yellow-100
            via-white
            to-yellow-50
          "
        >
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-[90px]" />
          <div className="absolute -left-20 top-20 h-52 w-52 rounded-full bg-orange-200/20 blur-[80px]" />
        </div>

        <div className="px-8 pb-10 md:px-10">
          {/* Avatar */}
          <div className="-mt-16 relative">
            <div
              className="
                flex
                h-32
                w-32
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border-4
                border-white
                bg-gradient-to-br
                from-yellow-400
                to-amber-500
                shadow-[0_10px_30px_rgba(234,179,8,0.25)]
              "
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl text-white">
                  👤
                </span>
              )}
            </div>
          </div>

          {/* Profile heading */}
          <div className="mt-6">
            <h1 className="text-4xl font-black tracking-tight text-slate-900">
              {profile.username}
            </h1>

            <p className="mt-2 text-sm font-bold uppercase tracking-[0.35em] text-yellow-600">
              {profile.role}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className={statCard}>
              <p className="text-sm font-medium text-slate-500">
                Level
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {level}
              </h2>
            </div>

            <div className={statCard}>
              <p className="text-sm font-medium text-slate-500">
                XP
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900">
                {profile.xp || 0}
              </h2>
            </div>

            {profile.role === "student" ? (
              <>
                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Tests
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    {attempts.length}
                  </h2>
                </div>

                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Best Score
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-green-500">
                    {bestScore}%
                  </h2>
                </div>

                <div className={`${statCard} md:col-span-2`}>
                  <p className="text-sm font-medium text-slate-500">
                    Average Score
                  </p>

                  <h2 className="mt-2 text-4xl font-black text-yellow-500">
                    {averageScore}%
                  </h2>
                </div>
              </>
            ) : (
              <>
                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Created Tests
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    {createdTests.length}
                  </h2>
                </div>

                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Total Attempts
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-slate-900">
                    {teacherAttempts.length}
                  </h2>
                </div>

                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Students
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-yellow-500">
                    {uniqueStudents}
                  </h2>
                </div>

                <div className={statCard}>
                  <p className="text-sm font-medium text-slate-500">
                    Total XP Given
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-yellow-500">
                    {totalTeacherXp}
                  </h2>
                </div>

                <div className={`${statCard} md:col-span-2`}>
                  <p className="text-sm font-medium text-slate-500">
                    Average Student Score
                  </p>

                  <h2 className="mt-2 text-4xl font-black text-sky-500">
                    {teacherAverage}%
                  </h2>
                </div>
              </>
            )}
          </div>

          {/* Edit button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/edit-profile")}
            className="
              mt-8
              rounded-2xl
              bg-gradient-to-r
              from-yellow-400
              to-amber-500
              px-8
              py-4
              font-black
              text-slate-900
              shadow-[0_10px_25px_rgba(234,179,8,0.2)]
              transition
              hover:shadow-[0_15px_35px_rgba(234,179,8,0.28)]
            "
          >
            Edit Profile
          </motion.button>
        </div>
      </motion.div>

      {/* Student */}
      {profile.role === "student" ? (
        <>
          <div className="mb-5 mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-600">
              Progress
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Recent Tests
            </h2>
          </div>

          <div className="space-y-4">
            {attempts.length === 0 ? (
              <div
                className="
                  rounded-[28px]
                  border
                  border-yellow-100
                  bg-gradient-to-br
                  from-white
                  to-yellow-50
                  p-12
                  text-center
                  shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
              >
                <div className="text-6xl">
                  📝
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-900">
                  No tests completed
                </h2>

                <p className="mt-2 text-slate-500">
                  Complete your first test to see your results here.
                </p>
              </div>
            ) : (
              attempts.map((attempt, index) => {
                const percentage = Math.round(
                  (attempt.score / attempt.total) * 100
                )

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2 }}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-[24px]
                      border
                      border-slate-200
                      bg-white
                      p-5
                      shadow-[0_8px_25px_rgba(15,23,42,0.04)]
                      transition
                      hover:border-yellow-200
                    "
                  >
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {attempt.tests?.title || "Completed Test"}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        +{attempt.xp || 0} XP
                      </p>
                    </div>

                    <div className="rounded-2xl bg-yellow-50 px-5 py-3 text-2xl font-black text-yellow-600">
                      {percentage}%
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <>
          <div className="mb-5 mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-yellow-600">
              Community
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Published Posts
            </h2>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div
                className="
                  rounded-[28px]
                  border
                  border-yellow-100
                  bg-gradient-to-br
                  from-white
                  to-yellow-50
                  p-12
                  text-center
                  shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                "
              >
                <div className="text-6xl">
                  📚
                </div>

                <h2 className="mt-4 text-2xl font-black text-slate-900">
                  No posts yet
                </h2>

                <p className="mt-2 text-slate-500">
                  Published posts will appear here.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ y: -2 }}
                  className="
                    rounded-[28px]
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-[0_8px_25px_rgba(15,23,42,0.04)]
                    transition
                    hover:border-yellow-200
                  "
                >
                  <p className="whitespace-pre-wrap text-slate-700">
                    {post.content}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}