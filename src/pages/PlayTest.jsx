import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "../supabase"

export default function PlayTest() {

  const { id } = useParams()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
const [answers, setAnswers] = useState({})
const [timeLeft, setTimeLeft] = useState(null)
const [finished, setFinished] = useState(false)
const [result, setResult] = useState(null)
const navigate = useNavigate()
const [blocked, setBlocked] = useState(false)
const [profile, setProfile] = useState(null)

  useEffect(() => {

    load()

  }, [])

  async function load() {

    const { data: testData } = await supabase
      .from("tests")
      .select("*")
      .eq("id", id)
      .single()

    setTest(testData)

    const { data: questionData } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", id)
      .order("sort_order")

    setQuestions(questionData || [])
    const {
  data: { user },
} = await supabase.auth.getUser()

if (testData.attempt_limit > 0) {

  const { count } = await supabase

    .from("test_attempts")

    .select("*", { count: "exact", head: true })

    .eq("user_id", user.id)

    .eq("test_id", id)

  if (count >= testData.attempt_limit) {

    setBlocked(true)

  }

}

  }
  useEffect(() => {

  if (!test) return

  setTimeLeft(test.time_limit * 60)

}, [test])
useEffect(() => {

  if (timeLeft === null) return

  if (finished) return

  if (timeLeft <= 0) {

    finishTest()

    return

  }

  const timer = setInterval(() => {

    setTimeLeft((prev) => prev - 1)

  }, 1000)

  return () => clearInterval(timer)

}, [timeLeft, finished])
  async function finishTest() {
    if (finished) return

setFinished(true)

  let score = 0

  questions.forEach((question) => {

    if (answers[question.id] === question.correct_answer) {

      score++

    }

  })

  const {
  data: { user },
} = await supabase.auth.getUser()
const { data: profileData } = await supabase

  .from("profiles")

  .select("role")

  .eq("id", user.id)

  .single()

setProfile(profileData)

const percent = Math.round((score / questions.length) * 100)

const xp = Math.round((score / questions.length) * test.xp_reward)

const { error } = await supabase

  .from("test_attempts")

  .insert({

    user_id: user.id,

    test_id: test.id,

    score,

    total: questions.length,

    xp,

    time_spent: 0,

  })
  const { data: profile } = await supabase

  .from("profiles")

  .select("xp")

  .eq("id", user.id)

  .single()

await supabase

  .from("profiles")

  .update({

    xp: (profile?.xp || 0) + xp,

  })

  .eq("id", user.id)

if (error) {

  alert(error.message)

  return

}

setResult({

  score,

  total: questions.length,

  xp,

  percent,

})

}

  if (!test) {

    return null

  }
  if (blocked) {

  return (

    <div className="max-w-3xl mx-auto text-center">

      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-12">

        <div className="text-7xl">

          🚫

        </div>

        <h1 className="mt-6 text-4xl font-black text-white">

          No Attempts Left

        </h1>

        <p className="mt-4 text-slate-300">

          You have already used all available attempts for this test.

        </p>

        <button

          onClick={() => navigate("/tests")}

          className="
          mt-10
          rounded-xl
          bg-yellow-400
          px-6
          py-3
          font-bold
          text-black
          "

        >

          Back to Tests

        </button>

      </div>

    </div>

  )

}
  if (result) {

  return (

    <div className="max-w-4xl mx-auto text-center">

      <div className="rounded-3xl border border-white/10 bg-white/5 p-12">

        <div className="text-7xl">

          🎉

        </div>

        <h1 className="mt-6 text-5xl font-black text-white">

          Test Completed

        </h1>

        <p className="mt-8 text-3xl font-bold text-yellow-300">

          {result.score} / {result.total}

        </p>

        <p className="mt-3 text-2xl text-white">

          {result.percent}%

        </p>

        <p className="mt-6 text-3xl font-bold text-green-400">

          +{result.xp} XP

        </p>
        <div className="mt-10 flex justify-center gap-4">

  <button

    onClick={() => navigate("/tests")}

    className="
    rounded-xl
    bg-white/10
    px-6
    py-3
    text-white
    hover:bg-white/20
    "

  >

    ← Back to Tests

  </button>

  <button

    onClick={() => window.location.reload()}

    className="
    rounded-xl
    bg-yellow-400
    px-6
    py-3
    font-bold
    text-black
    "

  >

    🔄 Retry Test

  </button>

</div>

      </div>

    </div>

  )

}
  const question = questions[current]

if (!question) {

  return (

    <div className="text-center text-white mt-20">

      This test has no questions.

    </div>

  )

}

  return (

    <div className="max-w-5xl mx-auto">

      <h1 className="text-5xl font-black text-white">

        {test.title}

      </h1>

      <p className="mt-3 text-slate-400">

        {test.description}

      </p>
      

      <div className="mt-10">

  <div className="flex items-center justify-between">

    <h2 className="text-2xl font-bold text-white">

      Question {current + 1} / {questions.length}

    </h2>

    <div className="rounded-xl bg-yellow-400/10 px-4 py-2 text-yellow-300">

      ⏱{" "}

{String(Math.floor(timeLeft / 60)).padStart(2, "0")}:

{String(timeLeft % 60).padStart(2, "0")}

    </div>

  </div>

  {question.image_url && (

    <img

      src={question.image_url}

      alt=""

      className="
      mt-8
      max-h-[350px]
      w-full
      rounded-2xl
      object-contain
      "

    />

  )}

  <h2 className="mt-8 text-3xl font-black text-white">

    {question.question}

  </h2>

  <div className="mt-8 grid gap-4">

    {["A","B","C","D"].map(letter => {

      const value = question[`option_${letter.toLowerCase()}`]

      return (

        <button

          key={letter}

          onClick={() =>
            setAnswers({
              ...answers,
              [question.id]: letter,
            })
          }

          className={`
          rounded-2xl
          border
          p-5
          text-left
          transition

          ${
            answers[question.id] === letter
              ? "border-yellow-400 bg-yellow-400/10"
              : "border-white/10 bg-white/5"
          }
          `}
        >

          <span className="font-bold text-yellow-300">

            {letter}.

          </span>{" "}

          <span className="text-white">

            {value}

          </span>

        </button>

      )

    })}

        </div>

      </div>
<div className="mt-10 flex justify-between">
    <button

  disabled={current === 0}

  onClick={() => setCurrent(current - 1)}

  className="
  rounded-xl
  bg-white/10
  px-6
  py-3
  disabled:opacity-40
  "

>

  ← Previous

</button>

  {current === questions.length - 1 ? (

  <button

    type="button"

    onClick={finishTest}

    className="
    rounded-xl
    bg-green-500
    px-6
    py-3
    font-bold
    text-white
    hover:bg-green-600
    "

  >

    ✅ Finish Test

  </button>

) : (
    

  <button

    type="button"

    onClick={() => setCurrent(current + 1)}

    className="
    rounded-xl
    bg-yellow-400
    px-6
    py-3
    font-bold
    text-black
    "

  >

    Next →

  </button>
  

)}

</div>
</div>


  )

}