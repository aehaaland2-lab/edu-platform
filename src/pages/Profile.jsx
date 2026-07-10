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

        item => Math.round((item.score / item.total) * 100)

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

    teacherAttempts.map(item => item.user_id)

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

      const { data, error } = await supabase
  .from("test_attempts")
.select(`
  score,
  total,
  xp,
  user_id,
  test_id
`)

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

        const ids = tests.map(test => test.id)

        const { data: allAttempts } = await supabase

          .from("test_attempts")

          .select(`
            score,
            total,
            user_id,
            test_id
          `)

          .in("test_id", ids)

        setTeacherAttempts(allAttempts || [])

      }

    }

  }

  if (!profile) {

    return (

      <div className="min-h-screen flex items-center justify-center text-white">

        Loading...

      </div>

    )

  }

  return (
    <div className="max-w-6xl mx-auto text-white">

  <motion.div

    initial={{ opacity: 0, y: 25 }}

    animate={{ opacity: 1, y: 0 }}

    className="
    overflow-hidden
    rounded-[34px]
    border
    border-white/10
    bg-white/5
    backdrop-blur-2xl
    "

  >

    <div className="h-48 bg-gradient-to-r from-yellow-500/20 via-violet-500/20 to-sky-500/20" />

    <div className="px-10 pb-10 -mt-16">

      <div
        className="
        flex
        h-32
        w-32
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-gradient-to-br
        from-yellow-400
        to-amber-500
        ring-4
        ring-[#09090B]
        "
      >

        {profile.avatar_url ? (

          <img

            src={profile.avatar_url}

            alt=""

            className="h-full w-full object-cover"

          />

        ) : (

          <span className="text-5xl">

            👤

          </span>

        )}

      </div>

      <h1 className="mt-5 text-4xl font-black">

        {profile.username}

      </h1>

      <p className="mt-2 tracking-[.35em] uppercase text-yellow-400">

        {profile.role}

      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-4">

        <div className="rounded-2xl bg-white/5 p-6">

          <p className="text-slate-400">

            Level

          </p>

          <h2 className="text-3xl font-black">

            {level}

          </h2>

        </div>

        <div className="rounded-2xl bg-white/5 p-6">

          <p className="text-slate-400">

            XP

          </p>

          <h2 className="text-3xl font-black">

            {profile.xp || 0}

          </h2>

        </div>
        {profile.role === "student" ? (
          

  <>

    <div className="rounded-2xl bg-white/5 p-6">

      <p className="text-slate-400">

        Completed Tests

      </p>

      <h2 className="text-3xl font-black">

        {attempts.length}

      </h2>

    </div>

    <div className="rounded-2xl bg-white/5 p-6">

      <p className="text-slate-400">

        Best Score

      </p>

      <h2 className="text-3xl font-black text-green-400">

        {bestScore}%

      </h2>

    </div>

    <div className="rounded-2xl bg-white/5 p-6 md:col-span-2">

      <p className="text-slate-400">

        Average Score

      </p>

      <h2 className="text-4xl font-black text-yellow-300">

        {averageScore}%

      </h2>

    </div>

  </>

) : (

  <>

    <div className="rounded-2xl bg-white/5 p-6">

      <p className="text-slate-400">

        Created Tests

      </p>

      <h2 className="text-3xl font-black">

        {createdTests.length}

      </h2>

    </div>

    <div className="rounded-2xl bg-white/5 p-6">

      <p className="text-slate-400">

        Total Attempts

      </p>

      <h2 className="text-3xl font-black">

        {teacherAttempts.length}

      </h2>

    </div>
    <div className="rounded-2xl bg-white/5 p-6">

  <p className="text-slate-400">

    Students

  </p>

  <h2 className="text-3xl font-black text-violet-300">

    {uniqueStudents}

  </h2>

</div>

<div className="rounded-2xl bg-white/5 p-6">

  <p className="text-slate-400">

    Total XP Given

  </p>

  <h2 className="text-3xl font-black text-yellow-300">

    {totalTeacherXp}

  </h2>

</div>

    <div className="rounded-2xl bg-white/5 p-6 md:col-span-2">

      <p className="text-slate-400">

        Average Student Score

      </p>

      <h2 className="text-4xl font-black text-sky-300">

        {teacherAverage}%

      </h2>

    </div>

  </>

)}
</div>
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
    font-bold
    text-black
  "
>
  Edit Profile
</motion.button>

</div>
</motion.div>

{profile.role === "student" ? (

  <>
<p className="text-red-500 text-2xl">
</p>
    <h2 className="mt-10 mb-5 text-3xl font-black">

      Recent Tests

    </h2>

    <div className="space-y-5">

      {attempts.length === 0 ? (

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

          <div className="text-6xl">📚</div>

          <h2 className="mt-4 text-2xl font-black">

            No tests completed

          </h2>

        </div>

      ) : (

        attempts.map((attempt, index) => (

          <div
            key={index}
            className="
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-5
            "
          >

            <div>

              <h3 className="text-xl font-bold">

                {attempt.tests?.title}

              </h3>

              <p className="mt-1 text-slate-400">

                +{attempt.xp} XP

              </p>

            </div>

            <div className="text-3xl font-black text-yellow-300">

              {Math.round((attempt.score / attempt.total) * 100)}%

            </div>

          </div>

        ))

      )}

    </div>

  </>

) : (

  <>

    <h2 className="mt-10 mb-5 text-3xl font-black">

      Published Posts

    </h2>

    <div className="space-y-5">

      {posts.length === 0 ? (

        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

          <div className="text-6xl">📝</div>

          <h2 className="mt-4 text-2xl font-black">

            No posts yet

          </h2>

        </div>

      ) : (

        posts.map(post => (

          <div
            key={post.id}
            className="
            rounded-3xl
            border
            border-white/10
            bg-white/5
            p-6
            "
          >

            <p className="whitespace-pre-wrap">

              {post.content}

            </p>

          </div>

        ))

      )}

    </div>

  </>

)}

</div>


)
}