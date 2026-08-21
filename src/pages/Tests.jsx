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
        (sum, item) =>
          sum + (item.total ? (item.score / item.total) * 100 : 0),
        0
      ) / attempts.length
    )
  }, [attempts])

  const bestScore = useMemo(() => {
    if (!attempts.length) return 0

    return Math.max(
      ...attempts.map((item) =>
        item.total
          ? Math.round((item.score / item.total) * 100)
          : 0
      )
    )
  }, [attempts])

  const teacherAverage = useMemo(() => {
    if (!teacherAttempts.length) return 0

    return Math.round(
      teacherAttempts.reduce(
        (sum, item) =>
          sum + (item.total ? (item.score / item.total) * 100 : 0),
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
          test_id
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
            xp,
            user_id,
            test_id
          `)
          .in("test_id", ids)

        setTeacherAttempts(allAttempts || [])
      } else {
        setTeacherAttempts([])
      }
    }
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-slate-200 border-t-yellow-400 animate-spin" />
          <p className="text-slate-500 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  const isStudent = profile.role === "student"

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-20 text-slate-900"
    >

      {/* PROFILE HEADER */}

      <section className="
        overflow-hidden
        rounded-[32px]
        border
        border-slate-200
        bg-white
        shadow-[0_20px_70px_rgba(15,23,42,0.08)]
      ">

        {/* Cover */}

        <div className="
          relative
          h-44
          overflow-hidden
          bg-gradient-to-r
          from-yellow-100
          via-slate-100
          to-sky-100
        ">

          <div className="
            absolute
            -right-20
            -top-32
            h-80
            w-80
            rounded-full
            bg-yellow-300/30
            blur-3xl
          " />

          <div className="
            absolute
            -left-20
            -bottom-32
            h-80
            w-80
            rounded-full
            bg-sky-300/20
            blur-3xl
          " />

          <div className="
            absolute
            inset-x-0
            bottom-0
            h-20
            bg-gradient-to-t
            from-white/50
            to-transparent
          " />

        </div>

        {/* Main profile */}

        <div className="px-7 pb-8 md:px-10">

          <div className="-mt-16 relative">

            {/* Avatar */}

            <div className="
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
              shadow-[0_12px_35px_rgba(15,23,42,0.18)]
            ">

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="
                  text-5xl
                  font-bold
                  text-white
                ">
                  {(profile.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}

            </div>

          </div>

          {/* Name */}

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <h1 className="
                text-4xl
                font-black
                tracking-tight
                text-slate-900
              ">
                {profile.username}
              </h1>

              <div className="mt-2 flex items-center gap-3">

                <span className="
                  rounded-full
                  bg-yellow-100
                  px-3
                  py-1
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.25em]
                  text-yellow-700
                ">
                  {profile.role}
                </span>

                <span className="text-sm text-slate-400">
                  Level {level}
                </span>

              </div>

            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/edit-profile")}
              className="
                rounded-2xl
                bg-gradient-to-r
                from-yellow-400
                to-amber-500
                px-7
                py-3.5
                font-bold
                text-slate-900
                shadow-[0_8px_25px_rgba(245,158,11,0.22)]
                transition
                hover:shadow-[0_12px_30px_rgba(245,158,11,0.3)]
              "
            >
              Edit Profile
            </motion.button>

          </div>

          {/* Statistics */}

          <div className="
            mt-8
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          ">

            <StatCard
              label="Level"
              value={level}
            />

            <StatCard
              label="XP"
              value={profile.xp || 0}
              accent="yellow"
            />

            {isStudent ? (
              <>
                <StatCard
                  label="Completed Tests"
                  value={attempts.length}
                />

                <StatCard
                  label="Best Score"
                  value={`${bestScore}%`}
                  accent="green"
                />
              </>
            ) : (
              <>
                <StatCard
                  label="Created Tests"
                  value={createdTests.length}
                />

                <StatCard
                  label="Total Attempts"
                  value={teacherAttempts.length}
                />
              </>
            )}

          </div>

          {/* Secondary statistics */}

          <div className="
            mt-4
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          ">

            {isStudent ? (
              <StatCard
                label="Average Score"
                value={`${averageScore}%`}
                accent="yellow"
                large
              />
            ) : (
              <>
                <StatCard
                  label="Students"
                  value={uniqueStudents}
                  accent="violet"
                />

                <StatCard
                  label="Total XP Given"
                  value={totalTeacherXp}
                  accent="yellow"
                />

                <StatCard
                  label="Average Student Score"
                  value={`${teacherAverage}%`}
                  accent="sky"
                  large
                />
              </>
            )}

          </div>

        </div>

      </section>

      {/* CONTENT */}

      {isStudent ? (

        <section className="mt-10">

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-yellow-600
              ">
                Progress
              </p>

              <h2 className="
                mt-1
                text-3xl
                font-black
                tracking-tight
                text-slate-900
              ">
                Recent Tests
              </h2>
            </div>

            <div className="text-sm text-slate-400">
              {attempts.length} completed
            </div>

          </div>

          {attempts.length === 0 ? (

            <EmptyState
              icon="📝"
              title="No tests completed"
              description="Complete your first test to see your results here."
            />

          ) : (

            <div className="space-y-4">

              {attempts.map((attempt, index) => {

                const percentage = attempt.total
                  ? Math.round(
                      (attempt.score / attempt.total) * 100
                    )
                  : 0

                return (
                  <motion.div
                    key={`${attempt.test_id}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-5
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-6
                      py-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >

                    <div className="flex items-center gap-4">

                      <div className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        bg-yellow-100
                        text-xl
                      ">
                        📝
                      </div>

                      <div>

                        <h3 className="
                          font-bold
                          text-slate-900
                        ">
                          Test
                        </h3>

                        <p className="
                          mt-1
                          text-sm
                          text-slate-500
                        ">
                          +{attempt.xp || 0} XP
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className="
                        text-2xl
                        font-black
                        text-yellow-500
                      ">
                        {percentage}%
                      </div>

                      <p className="
                        text-xs
                        text-slate-400
                      ">
                        {attempt.score}/{attempt.total}
                      </p>

                    </div>

                  </motion.div>
                )
              })}

            </div>

          )}

        </section>

      ) : (

        <section className="mt-10">

          <div className="mb-5">

            <p className="
              text-xs
              font-bold
              uppercase
              tracking-[0.3em]
              text-yellow-600
            ">
              Teacher
            </p>

            <h2 className="
              mt-1
              text-3xl
              font-black
              tracking-tight
              text-slate-900
            ">
              Published Posts
            </h2>

          </div>

          {posts.length === 0 ? (

            <EmptyState
              icon="📚"
              title="No posts yet"
              description="Published posts will appear here."
            />

          ) : (

            <div className="space-y-4">

              {posts.map((post, index) => (

                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:shadow-md
                  "
                >

                  <p className="
                    whitespace-pre-wrap
                    leading-7
                    text-slate-700
                  ">
                    {post.content}
                  </p>

                </motion.div>

              ))}

            </div>

          )}

        </section>

      )}

    </motion.div>
  )
}

function StatCard({
  label,
  value,
  accent = "default",
  large = false,
}) {

  const accentClasses = {
    default: "text-slate-900",
    yellow: "text-yellow-500",
    green: "text-emerald-500",
    violet: "text-violet-500",
    sky: "text-sky-500",
  }

  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-slate-50
      p-5
      transition
      hover:bg-white
      hover:shadow-sm
    ">

      <p className="
        text-sm
        font-medium
        text-slate-500
      ">
        {label}
      </p>

      <p className={`
        mt-2
        font-black
        tracking-tight
        ${large ? "text-4xl" : "text-3xl"}
        ${accentClasses[accent]}
      `}>
        {value}
      </p>

    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}) {

  return (
    <div className="
      rounded-3xl
      border
      border-slate-200
      bg-white
      px-6
      py-14
      text-center
      shadow-sm
    ">

      <div className="text-5xl">
        {icon}
      </div>

      <h3 className="
        mt-4
        text-2xl
        font-black
        text-slate-900
      ">
        {title}
      </h3>

      <p className="
        mx-auto
        mt-2
        max-w-md
        text-slate-500
      ">
        {description}
      </p>

    </div>
  )
}