import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import TestCard from "../components/tests/TestCard"

import FolderCard from "../components/tests/FolderCard"
import Breadcrumbs from "../components/tests/Breadcrumbs"

export default function Tests() {

  const [profile, setProfile] = useState(null)

  const [folders, setFolders] = useState([])

  const [currentFolder, setCurrentFolder] = useState(null)

  const [path, setPath] = useState([])
  const [showModal, setShowModal] = useState(false)

  const [folderName, setFolderName] = useState("")
  const [tests, setTests] = useState([])
  const [showTestModal, setShowTestModal] = useState(false)

    const [testTitle, setTestTitle] = useState("")
    const [testDescription, setTestDescription] = useState("")
    const [timeLimit, setTimeLimit] = useState(15)
    const [xpReward, setXpReward] = useState(100)

  useEffect(() => {

    loadProfile()

  }, [])

  useEffect(()=>{

    loadFolders()

    loadTests()

},[currentFolder])

  async function loadProfile() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(data)
    console.log(data)

  }

  async function loadFolders() {

    let query = supabase
      .from("folders")
      .select("*")
      .order("name")

    if (currentFolder) {

      query = query.eq("parent_id", currentFolder)

    } else {

      query = query.is("parent_id", null)

    }

    const { data } = await query

    setFolders(data || [])

  }
  async function loadTests(){

  if(!currentFolder){

    setTests([])

    return

  }

  const { data } = await supabase

    .from("tests")

    .select("*")

    .eq("folder_id",currentFolder)

    .order("created_at")

  setTests(data || [])

}

  async function openFolder(folder) {

    setPath((v) => [...v, folder])

    setCurrentFolder(folder.id)

  }

  function goTo(folderId) {

    if (folderId === null) {

      setCurrentFolder(null)

      setPath([])

      return

    }

    const index = path.findIndex((x) => x.id === folderId)

    if (index === -1) return

    setPath(path.slice(0, index + 1))

    setCurrentFolder(folderId)

  }
  async function createFolder() {

    if (!folderName.trim()) return

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
        .from("folders")
        .insert({

        name: folderName,

        parent_id: currentFolder,

        created_by: user.id,

        })

    if (error) {

        alert(error.message)

        return

    }

    setFolderName("")

    setShowModal(false)

    loadFolders()

    }
    async function createTest() {

  if (!testTitle.trim()) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("tests")
    .insert({

      folder_id: currentFolder,

      title: testTitle,

      description: testDescription,

      time_limit: Number(timeLimit),

      xp_reward: Number(xpReward),

      created_by: user.id,

    })

  if (error) {
    alert(error.message)
    return
  }

  setTestTitle("")
  setTestDescription("")
  setTimeLimit(15)
  setXpReward(100)

  setShowTestModal(false)

  loadTests()

}

  return (

    <div className="max-w-7xl mx-auto pb-20">

      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-5xl font-black text-slate-900">Tests</h1>

          <p className="text-slate-500 mt-2 text-lg">

            Browse folders and tests.

          </p>

        </div>

      </div>

      <Breadcrumbs
        path={path}
        goTo={goTo}
        />

        <div className="mb-8 flex gap-4">

  {currentFolder && (

    <button

      onClick={() => {

        if(path.length===1){

          setCurrentFolder(null)

          setPath([])

          return

        }

        const newPath=[...path]

        newPath.pop()

        setPath(newPath)

        setCurrentFolder(
          newPath.length
            ? newPath[newPath.length-1].id
            : null
        )

      }}

      className="
      rounded-xl
      bg-white/10
      px-5
      py-3
      "
    >
      ← Back
    </button>

  )}

 {profile?.role === "teacher" && (

  <button

    onClick={() => setShowTestModal(true)}

    disabled={false}

    className="
    rounded-xl
    bg-indigo-500
    px-5
    py-3
    font-bold
    disabled:opacity-40
    "

  >

    + New Test

  </button>

)}

</div>


      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {folders.map(folder => (

          <FolderCard

            key={folder.id}

            folder={folder}

            open={openFolder}

          />

        ))}
        {tests.map(test=>(

            <TestCard

  key={test.id}

  test={test}

  profile={profile}

/>

        ))}

      </div>
      {showModal && (

        <div
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

        <div
        className="
        w-[450px]
        rounded-3xl
        bg-[#111318]
        border
        border-white/10
        p-8
        "
        >

    <h2 className="text-3xl font-black mb-6">

    New Folder

    </h2>

    <input

    value={folderName}

    onChange={(e)=>setFolderName(e.target.value)}

    placeholder="Folder name"

    className="
    w-full
    rounded-2xl
    bg-black/20
    border
    border-white/10
    px-5
    py-4
    outline-none
    "
    />

    <div className="mt-8 flex justify-end gap-3">

    <button

    onClick={()=>setShowModal(false)}

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

    onClick={createFolder}

    className="
    rounded-xl
    bg-yellow-400
    px-6
    py-3
    font-bold
    text-black
    "
    >

    Create

    </button>

    </div>

    </div>

    </div>

    )}
    {profile?.role === "teacher" && showTestModal && (

<div
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

<div
className="
w-[600px]
rounded-3xl
border
border-white/10
bg-[#111318]
p-8
"
>

<h2 className="text-3xl font-black mb-8">

New Test

</h2>

<input

value={testTitle}

onChange={(e)=>setTestTitle(e.target.value)}

placeholder="Title"

className="
mb-4
w-full
rounded-xl
border
border-white/10
bg-black/20
px-4
py-3
"
/>

<textarea

rows={4}

value={testDescription}

onChange={(e)=>setTestDescription(e.target.value)}

placeholder="Description"

className="
mb-4
w-full
rounded-xl
border
border-white/10
bg-black/20
px-4
py-3
"
/>

<div className="mt-5 grid grid-cols-2 gap-5">

  <div>

    <p className="mb-2 text-sm text-slate-400">
      ⏱ Time Limit (minutes)
    </p>

    <input
      type="number"
      min="1"
      value={timeLimit}
      onChange={(e)=>setTimeLimit(e.target.value)}
      className="
        w-full
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

  <div>

    <p className="mb-2 text-sm text-slate-400">
      ⭐ XP Reward
    </p>

    <input
      type="number"
      min="0"
      value={xpReward}
      onChange={(e)=>setXpReward(e.target.value)}
      className="
        w-full
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

</div>

<div className="mt-8 flex justify-end gap-3">

<button

onClick={()=>setShowTestModal(false)}

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

onClick={createTest}

className="
rounded-xl
bg-indigo-500
px-6
py-3
font-bold
"
>

Create

</button>

</div>

</div>

</div>

)}

        </div>

    )

}