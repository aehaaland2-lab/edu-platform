import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { supabase } from "../../supabase"

export default function QuestionModal({

  show,

  close,

  testId,

  reload,

  editingQuestion,

}) {
  const [question, setQuestion] = useState("")

const [optionA, setOptionA] = useState("")
const [optionB, setOptionB] = useState("")
const [optionC, setOptionC] = useState("")
const [optionD, setOptionD] = useState("")
const [saving, setSaving] = useState(false)
const [image, setImage] = useState(null)

const [correct, setCorrect] = useState("A")
useEffect(() => {

  if (!editingQuestion) return

  setQuestion(editingQuestion.question || "")

  setOptionA(editingQuestion.option_a || "")
  setOptionB(editingQuestion.option_b || "")
  setOptionC(editingQuestion.option_c || "")
  setOptionD(editingQuestion.option_d || "")

  setCorrect(editingQuestion.correct_answer || "A")

}, [editingQuestion])
async function saveQuestion() {

    if (!question.trim()) {

        alert("Write a question")

        return

    }

    if (
        !optionA.trim() ||
        !optionB.trim() ||
        !optionC.trim() ||
        !optionD.trim()
    ) {

        alert("Fill every answer")

        return

    }

    setSaving(true)
    let imageUrl = null

if (image) {

  const fileName =
    `${Date.now()}-${image.name}`

  const { error: uploadError } = await supabase.storage

    .from("question-images")

    .upload(fileName, image)

  if (uploadError) {

    alert(uploadError.message)

    setSaving(false)

    return

  }

  imageUrl = supabase.storage

    .from("question-images")

    .getPublicUrl(fileName)

    .data.publicUrl

}

    let query

if (editingQuestion) {

    query = supabase

        .from("questions")

        .update({

            question,

image_url: imageUrl || editingQuestion.image_url,

            option_a: optionA,

            option_b: optionB,

            option_c: optionC,

            option_d: optionD,

            correct_answer: correct,

        })

        .eq("id", editingQuestion.id)

} else {

    query = supabase

        .from("questions")

        .insert({

            test_id: testId,

            question,
            image_url: imageUrl,

            option_a: optionA,

            option_b: optionB,

            option_c: optionC,

            option_d: optionD,

            correct_answer: correct,

            points: 1,

            sort_order: 0,

        })

}

const { error } = await query

    setSaving(false)

    if (error) {

        alert(error.message)

        return

    }

    setQuestion("")

    setOptionA("")
    setOptionB("")
    setOptionC("")
    setOptionD("")

    setCorrect("A")

    reload()

    close()
    setQuestion("")

setOptionA("")
setOptionB("")
setOptionC("")
setOptionD("")

setCorrect("A")

}

  return (

    <AnimatePresence>

      {show && (

        <motion.div

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          exit={{ opacity: 0 }}

          className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/70
          backdrop-blur-sm
          "

        >

          <motion.div

            initial={{
              scale: .9,
              opacity: 0,
            }}

            animate={{
              scale: 1,
              opacity: 1,
            }}

            exit={{
              scale: .9,
              opacity: 0,
            }}

            className="
            w-[750px]
            rounded-3xl
            border
            border-white/10
            bg-[#111318]
            p-8
            "

          >

            <div className="flex items-center justify-between">

              <h2 className="text-3xl font-black text-white">

                New Question

              </h2>

              <button

                onClick={close}

                className="
                rounded-xl
                bg-white/10
                px-4
                py-2
                hover:bg-white/20
                "

              >

                ✕

              </button>

            </div>

            <div className="mt-8">

              <textarea
              value={question}

            onChange={(e) => setQuestion(e.target.value)}

                rows={4}

                placeholder="Write your question..."

                className="
                text-white
placeholder:text-slate-500
                w-full
                rounded-2xl
                border
                border-white/10
                bg-black/20
                px-5
                py-4
                outline-none
                focus:border-yellow-400
                "

              />
              <div className="mt-6">

  <p className="mb-2 text-slate-300">

    Question Image (optional)

  </p>

  <input

    type="file"

    accept="image/*"

    onChange={(e) => setImage(e.target.files[0])}

    className="
    w-full
    rounded-xl
    border
    border-white/10
    bg-black/20
    text-white
    file:mr-4
    file:rounded-lg
    file:border-0
    file:bg-yellow-400
    file:px-4
    file:py-2
    file:font-bold
    file:text-black
    "

  />

</div>
              <div className="mt-8 grid gap-4">

  <input
    value={optionA}
    onChange={(e)=>setOptionA(e.target.value)}
    placeholder="Option A"
    className="
    text-white
placeholder:text-slate-500
      rounded-xl
      border
      border-white/10
      bg-black/20
      px-4
      py-3
      outline-none
      focus:border-yellow-400
    "
  />

  <input
    value={optionB}
    onChange={(e)=>setOptionB(e.target.value)}
    placeholder="Option B"
    className="
    text-white
placeholder:text-slate-500
      rounded-xl
      border
      border-white/10
      bg-black/20
      px-4
      py-3
      outline-none
      focus:border-yellow-400
    "
  />

  <input
    value={optionC}
    onChange={(e)=>setOptionC(e.target.value)}
    placeholder="Option C"
    className="
    text-white
placeholder:text-slate-500
      rounded-xl
      border
      border-white/10
      bg-black/20
      px-4
      py-3
      outline-none
      focus:border-yellow-400
    "
  />

  <input
    value={optionD}
    onChange={(e)=>setOptionD(e.target.value)}
    placeholder="Option D"
    className="
    text-white
placeholder:text-slate-500
      rounded-xl
      border
      border-white/10
      bg-black/20
      px-4
      py-3
      outline-none
      focus:border-yellow-400
    "
  />

</div>
<div className="mt-8">

  <p className="mb-3 text-slate-300">

    Correct Answer

  </p>

  <div className="flex gap-3">

    {["A","B","C","D"].map(letter=>(

      <button
      type="button"

        key={letter}

        onClick={()=>setCorrect(letter)}

        className={`
        h-14
        w-14
        rounded-xl
        font-bold
        transition

        ${
          correct===letter
          ? "bg-yellow-400 text-black"
          : "bg-white/10 text-white"
        }
        `}

      >

        {letter}

      </button>

    ))}

  </div>

</div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <button

                onClick={close}

                className="
                rounded-xl
                bg-white/10
                px-6
                py-3
                "

              >

                Cancel

              </button>

              <button

    type="button"

    onClick={saveQuestion}

    disabled={saving}

    className="
    rounded-xl
    bg-gradient-to-r
    from-yellow-400
    to-amber-500
    px-6
    py-3
    font-bold
    text-black
    disabled:opacity-50
    "

>

    {saving ? "Saving..." : "Save Question"}

</button>

            </div>

          </motion.div>

        </motion.div>

      )}

    </AnimatePresence>

  )

}