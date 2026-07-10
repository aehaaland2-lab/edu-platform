import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom"
import QuestionModal from "../components/tests/QuestionModal"

export default function TestEditor(){

    const { id } = useParams()
    const [profile, setProfile] = useState(null)

    const [test,setTest]=useState(null)

    const [questions,setQuestions]=useState([])

    const [loading, setLoading] = useState(true)
    
    const [showQuestionModal,setShowQuestionModal]=useState(false)

    const navigate = useNavigate()
    const [editingQuestion, setEditingQuestion] = useState(null)

    useEffect(()=>{

        loadTest()
        loadQuestions()

    },[])

    async function loadTest() {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  setProfile(profileData)

  const { data } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single()

  setTest(data)

  setLoading(false)

}

    async function loadQuestions(){

        const { data } = await supabase

            .from("questions")

            .select("*")

            .eq("test_id",id)

            .order("sort_order")

        setQuestions(data || [])

    }
    async function deleteQuestion(id) {

  if (!confirm("Delete this question?")) return

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id)

  if (error) {
    alert(error.message)
    return
  }

  loadQuestions()

}

    if (loading) {

  return (
    <div className="flex h-[70vh] items-center justify-center">

      <div className="h-16 w-16 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />

    </div>
  )

}
if (profile && profile.role !== "teacher") {

  return (

    <div className="max-w-4xl mx-auto text-center mt-20">

      <h1 className="text-5xl font-black text-white">

        🚫 Access Denied

      </h1>

      <p className="mt-4 text-slate-400">

        Only teachers can access the Test Editor.

      </p>

    </div>

  )

}

    return(

        <div className="max-w-6xl mx-auto">
            <button
  onClick={() => navigate("/tests")}
  className="
mb-6
flex
items-center
gap-2
rounded-xl
border
border-white/10
bg-[#171B22]
px-5
py-3
text-white
transition
hover:border-yellow-400/20
hover:text-yellow-300
"
>
  ← Back to Tests
</button>

            <motion.div

                initial={{
                    opacity:0,
                    y:15,
                }}

                animate={{
                    opacity:1,
                    y:0,
                }}

                className="
                relative
                overflow-hidden
                rounded-[34px]
                border
                border-white/10
                bg-gradient-to-br
                from-[#1A1D26]
                via-[#111318]
                to-[#0B0C10]
                px-10
py-8
                shadow-[0_30px_80px_rgba(0,0,0,.55)]
                "

            >
            <div className="absolute -right-24 -top-24 h-40
w-40
blur-[90px]
opacity-60 rounded-full bg-yellow-400/10" />

            <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[150px]" />

                <div className="relative z-10">

<p className="
inline-block
rounded-full
bg-yellow-400/10
px-4
py-2
text-sm
font-bold
tracking-[0.3em]
text-yellow-300
">

TEST EDITOR

</p>

<h1 className="mt-5 text-5xl font-black tracking-tight text-white drop-shadow-[0_0_18px_rgba(255,255,255,.18)]">

                    {test.title}
                    </h1>

<p className="mt-5 max-w-3xl text-lg text-xl
leading-8
text-slate-200">

{test.description || "No description yet."}

</p>

</div>

                <div className="relative z-10 mt-10 flex flex-wrap gap-4">

                    <div
className="
rounded-2xl
border
border-white/10
bg-[#171B22]
px-6
py-5
text-white
transition
hover:border-yellow-400/20
hover:-translate-y-1
"
>

                    <span className="font-bold text-white">
                        ⏱ {test.time_limit} min
                    </span>

                    </div>

                    <div
className="
rounded-2xl
border
border-white/10
bg-[#171B22]
px-6
py-5
text-white
transition
hover:border-yellow-400/20
hover:-translate-y-1
"
>
                    <span className="font-bold text-yellow-300">
                        ⭐ {test.xp_reward} XP
                    </span>

                    </div>
                    <div
className="
rounded-2xl
border
border-white/10
bg-[#171B22]
px-6
py-5
text-white
transition
hover:border-yellow-400/20
hover:-translate-y-1
"
>
                    <span className="font-bold text-sky-300">
                        ❓{questions.length} Questions
                    </span>
                    </div>

                </div>

            </motion.div>

            <div className="mt-10">

                <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">

                    <h2 className="text-3xl font-black text-white">

                        Questions

                    </h2>

                    <button

  onClick={() => {

  setEditingQuestion(null)

  setShowQuestionModal(true)

}}

  className="
  rounded-2xl
  bg-gradient-to-r
  from-yellow-400
  to-amber-500
  px-7
  py-3
  font-bold
  text-black
  transition
  hover:scale-105
  hover:shadow-[0_10px_35px_rgba(250,204,21,.35)]
  active:scale-95
"

>

+ Add Question

</button>
<button

  onClick={() => navigate(`/test/play/${id}`)}

  className="
  rounded-2xl
  bg-green-500
  px-7
  py-3
  font-bold
  text-white
  transition
  hover:bg-green-600
  "

>

▶ Start Test

</button>

                </div>

                <div className="mt-8 space-y-5">
                    {questions.length===0 && (

<div
className="
rounded-3xl
border
border-dashed
border-white/10
bg-white/5
py-32
text-center

"
>

<div className="text-7xl">

📚

</div>

<h2 className="mt-6 text-3xl font-black text-white">

No questions yet

</h2>

<p className="mt-3 text-lg text-slate-300">

Create your first question.

</p>

</div>

)}

                    {questions.map(question=>(

                        <div

                            key={question.id}

                            className="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-6
                            "

                        >

{question.image_url && (

  <img

    src={question.image_url}

    alt="Question"

    className="
    mb-5
    max-h-[350px]
    w-full
    rounded-2xl
    object-contain
    border
    border-white/10
    bg-black/20
    "

  />

)}
                            <p className="text-xl font-bold text-white">
  {question.question}
</p>
<div className="mt-5 space-y-3">

  <div className={`rounded-xl p-3 ${
    question.correct_answer === "A"
      ? "bg-green-500/20 border border-green-500/30"
      : "bg-white/5"
  }`}>
    <span className="font-bold text-slate-300">A.</span>{" "}
    <span className="text-white">{question.option_a}</span>
  </div>

  <div className={`rounded-xl p-3 ${
    question.correct_answer === "B"
      ? "bg-green-500/20 border border-green-500/30"
      : "bg-white/5"
  }`}>
    <span className="font-bold text-slate-300">B.</span>{" "}
    <span className="text-white">{question.option_b}</span>
  </div>

  <div className={`rounded-xl p-3 ${
    question.correct_answer === "C"
      ? "bg-green-500/20 border border-green-500/30"
      : "bg-white/5"
  }`}>
    <span className="font-bold text-slate-300">C.</span>{" "}
    <span className="text-white">{question.option_c}</span>
  </div>

  <div className={`rounded-xl p-3 ${
    question.correct_answer === "D"
      ? "bg-green-500/20 border border-green-500/30"
      : "bg-white/5"
  }`}>
    <span className="font-bold text-slate-300">D.</span>{" "}
    <span className="text-white">{question.option_d}</span>
  </div>

</div>
                            <div className="mt-6 flex justify-end gap-3">

    <button

        type="button"

        onClick={() => {

            setEditingQuestion(question)

            setShowQuestionModal(true)

        }}

        className="
        rounded-xl
        bg-sky-500/10
        border
        border-sky-500/20
        px-5
        py-2
        text-sky-300
        transition
        hover:bg-sky-500/20
        "

    >

        ✏ Edit

    </button>

    <button

        type="button"

        onClick={() => deleteQuestion(question.id)}

        className="
        rounded-xl
        bg-red-500/10
        border
        border-red-500/20
        px-5
        py-2
        text-red-400
        transition
        hover:bg-red-500/20
        "

    >

        🗑 Delete

    </button>

</div>

                        </div>
                        

                    ))}

                </div>

            </div>
            <QuestionModal

show={showQuestionModal}

close={() => {

  setShowQuestionModal(false)

  setEditingQuestion(null)

}}

testId={id}

reload={loadQuestions}

editingQuestion={editingQuestion}

/>

        </div>

    )

}