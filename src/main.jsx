import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import './index.css'

const KEY = 'proxyWorkoutReactState'
const defaults = { name:'Jordan', goal:'Maintain', theme:'light', xp:1280, level:8, streak:12, score:742, calories:2840, history:[], mastery:{Squats:91,'Push-ups':73,Plank:42,Lunges:64} }
const playlists = [
  {name:'QUICK BURN', icon:'⚡', detail:'8 min · 3 exercises', exercise:'Jumping jacks', reps:20, sets:2, tone:'orange'},
  {name:'LEG DAY', icon:'◒', detail:'18 min · 4 exercises', exercise:'Squats', reps:12, sets:3, tone:'blue'},
  {name:'UPPER BODY', icon:'⬡', detail:'15 min · 3 exercises', exercise:'Push-ups', reps:10, sets:3, tone:'pink'},
  {name:'CORE PROTOCOL', icon:'▬', detail:'12 min · 3 exercises', exercise:'Sit-ups', reps:15, sets:3, tone:'green'},
]
const dialogue = {
  idle:['I was promised a desk job.','Systems nominal. Muscles suspiciously untouched.'],
  start:['Fine. Initiating human replacement protocol.','I hope you appreciate this sacrifice.'],
  rep:['That was basically one rep.','My form is mostly theoretical.'],
  fatigue:['I CAN FEEL MY SOUL LEAVING.','Is there a union for this?'],
  rest:['Hydrating.exe','Recovering. Emotionally, not physically.'],
  complete:['We survived. You did nothing. Incredible teamwork.']
}
const pick = c => dialogue[c][Math.floor(Math.random()*dialogue[c].length)]
const tone = {orange:'bg-orange-50 text-orange-500',blue:'bg-blue-50 text-blue-500',pink:'bg-pink-50 text-pink-500',green:'bg-emerald-50 text-emerald-500'}

function App(){
  const [state,setState] = useState(()=>({...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}))
  const [page,setPage] = useState('dashboard')
  const [modal,setModal] = useState(false)
  const [toast,setToast] = useState('')
  const [rotation,setRotation] = useState(0)
  const [workout,setWorkout] = useState({active:false,paused:false,exercise:'Squats',reps:12,sets:3,currentRep:0,currentSet:0,fatigue:0,energy:100,stress:5,motivation:100,performance:100})
  const [selected,setSelected] = useState(1)
  const [rest,setRest] = useState(12)
  const [custom,setCustom] = useState({exercise:'Squats',reps:12,sets:3})

  useEffect(()=>localStorage.setItem(KEY,JSON.stringify(state)),[state])
  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(''),2600); return()=>clearTimeout(t)},[toast])
  useEffect(()=>{ document.body.classList.toggle('dark',state.theme==='dark') },[state.theme])

  const showToast = m => setToast(m)
  const navigate = p => { setPage(p); if(p==='workout') window.scrollTo({top:0,behavior:'smooth'}) }
  const begin = config => {
    setWorkout({active:true,paused:false,exercise:config.exercise,reps:config.reps,sets:config.sets,currentRep:0,currentSet:0,fatigue:0,energy:100,stress:5,motivation:100,performance:100})
    setSelected(playlists.findIndex(x=>x.exercise===config.exercise))
    navigate('workout'); setModal(false); showToast(`${config.name||'CUSTOM PROTOCOL'} loaded.`)
  }
  const completeRep = () => {
    if(!workout.active || workout.paused) return
    const nextRep=workout.currentRep+1
    const fatigue=Math.min(100,workout.fatigue+4.5+workout.currentSet*.8)
    const next={...workout,currentRep:nextRep,energy:Math.max(0,workout.energy-2.8),fatigue,stress:Math.min(100,workout.stress+(fatigue>55?2.2:.7)),motivation:Math.max(0,workout.motivation-.8),performance:Math.max(15,100-fatigue*.52)}
    if(nextRep>=workout.reps){
      if(workout.currentSet+1>=workout.sets){
        finish(next); return
      }
      setWorkout({...next,active:false,currentRep:0,currentSet:workout.currentSet+1})
      showToast(`Set ${workout.currentSet+1} complete · ${rest}s recovery`)
      return
    }
    setWorkout(next)
  }
  const finish = final => {
    const gained=180, calories=Math.round(final.fatigue*3.1)
    setWorkout({...final,active:false,currentRep:0,currentSet:final.sets})
    setState(s=>({...s,xp:s.xp+gained,calories:s.calories+calories,score:s.score+8,mastery:{...s.mastery,[final.exercise]:Math.min(100,(s.mastery[final.exercise]||35)+3)},history:[{exercise:final.exercise,date:'Just now · completed',score:'+180 XP'},...s.history]}))
    showToast('+180 XP · Your muscles remain suspiciously unaffected.')
  }
  const skipSet=()=>{ if(workout.active||workout.paused){ const next={...workout,currentRep:0,currentSet:workout.currentSet+1,active:false}; if(next.currentSet>=next.sets) finish(next); else setWorkout(next) } }
  const restart=()=>begin({exercise:workout.exercise,reps:workout.reps,sets:workout.sets,name:'RESTART'})

  const greeting = new Date().getHours()<12?'Good morning':new Date().getHours()<18?'Good afternoon':'Good evening'
  return <div className="min-h-screen">
    <div className="ambient"><span/><span/><span/></div>
    <Sidebar page={page} navigate={navigate} state={state} setState={setState}/>
    <main className="relative z-[1] md:ml-[230px] min-h-screen">
      <header className="topbar-bg sticky top-0 z-20 h-[64px] border-b border-slate-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 md:px-8">
        <div className="hidden md:block text-[10px] font-mono tracking-widest text-slate-400">PROXY WORKOUT <span className="mx-2">/</span> <b className="text-slate-700 dark:text-slate-200">{page.toUpperCase()}</b></div>
        <div className="md:hidden font-extrabold tracking-[.18em] text-xs">✦ PROXY</div>
        <div className="flex items-center gap-2"><button className="w-9 h-9 rounded-xl border border-slate-200 bg-white/70 text-slate-500">♧</button><button className="soft flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"><span className="grid place-items-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 font-bold">{state.name[0]}</span><span className="hidden sm:block">{state.name}</span>⌄</button></div>
      </header>
      {page==='dashboard' && <Dashboard state={state} greeting={greeting} navigate={navigate} setModal={setModal} setState={setState}/>} 
      {page==='workout' && <Workout workout={workout} setWorkout={setWorkout} rest={rest} setRest={setRest} rotation={rotation} setRotation={setRotation} completeRep={completeRep} skipSet={skipSet} restart={restart} navigate={navigate}/>} 
      {page==='profile' && <Profile state={state} setState={setState} />}
    </main>
    {modal && <WorkoutModal custom={custom} setCustom={setCustom} setModal={setModal} begin={begin}/>} 
    {toast && <div className="fixed z-50 bottom-7 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs shadow-2xl">{toast}</div>}
  </div>
}

function Sidebar({page,navigate,state,setState}){
  return <aside className="sidebar-bg fixed z-30 bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-[230px] md:h-screen border-t md:border-t-0 md:border-r border-slate-200 bg-white/90 backdrop-blur-xl flex md:flex-col p-2 md:p-5">
    <button onClick={()=>navigate('dashboard')} className="hidden md:flex items-center gap-3 px-2 py-2 text-left"><span className="text-2xl">✦</span><span className="text-[13px] leading-3 font-medium tracking-[.15em]">PROXY<br/><b>WORKOUT</b></span></button>
    <div className="hidden md:block text-[9px] uppercase tracking-[.2em] text-slate-400 mt-9 mb-2">Workspace</div>
    <nav className="flex w-full justify-around md:justify-start md:flex-col gap-1">
      {[['dashboard','⌂','Dashboard'],['workout','◒','Workout'],['profile','◉','Profile']].map(([p,icon,label])=><button key={p} onClick={()=>navigate(p)} className={`relative flex items-center justify-center md:justify-start gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition ${page===p?'bg-indigo-50 text-indigo-600':'text-slate-500 hover:bg-slate-50'}`}><span className="text-lg">{icon}</span>{label}{p==='workout'&&<i className="absolute top-2 left-[calc(50%+18px)] md:static md:ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"/>}</button>)}
    </nav>
    <div className="hidden md:block mt-auto">
      <div className="surface border border-slate-200 rounded-2xl p-3 flex items-center gap-2"><span className="grid place-items-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500">◒</span><div className="min-w-0"><b className="block text-[10px]">Proxy online</b><small className="text-[9px] text-slate-400">Ready to suffer</small></div><span className="ml-auto w-2 h-2 rounded-full bg-emerald-400"/></div>
      <button onClick={()=>setState(s=>({...s,theme:s.theme==='dark'?'light':'dark'}))} className="soft mt-2 w-full flex justify-between items-center rounded-xl border border-slate-200 px-3 py-2.5 text-[10px] text-slate-500"><span>☼ {state.theme==='dark'?'Dark':'Light'} mode</span><b>☾</b></button>
      <div className="text-[8px] font-mono text-slate-400 mt-4">v2.0 · Fictional fitness OS</div>
    </div>
  </aside>
}

function Dashboard({state,greeting,navigate,setModal}){
 const mastery=Object.entries(state.mastery)
 return <section className="px-5 md:px-8 py-8 max-w-[1500px] mx-auto">
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7"><div><p className="text-[9px] font-mono tracking-[.2em] text-slate-400 uppercase">Saturday, September 12, 2026</p><h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-2">{greeting}, <span>{state.name}</span> <span className="text-indigo-400">✦</span></h1><p className="muted text-sm text-slate-500 mt-2">Your proxy is warmed up. Your muscles remain completely uninvolved.</p></div><button onClick={()=>setModal(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-3 shadow-lg shadow-indigo-200">＋ Create workout</button></div>
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
   <Stat title="Proxy fitness score" value={state.score} suffix="/ 1000" note="Fictional score · Extremely legitimate" trend="↗ 12.4%" ring/>
   <Stat title="Current streak" value={state.streak} suffix="days" note="Most impressive to your AI" icon="✦" />
   <Stat title="Proxy calories" value={state.calories.toLocaleString()} suffix="kcal" note="Your AI burned them. Obviously." icon="◌" progress={68}/>
   <Stat title="Level" value={String(state.level).padStart(2,'0')} suffix="Operator" note={<><b>{state.xp.toLocaleString()}</b> / 2,000 XP to level 9</>} progress={Math.min(100,state.xp/20)} />
  </div>
  <div className="grid lg:grid-cols-2 gap-4 mt-4">
   <Panel><div className="flex justify-between gap-4"><div><Kicker>TODAY'S DIRECTIVE</Kicker><h2 className="text-lg font-extrabold mt-1">Make your AI regret being created.</h2></div><span className="text-[9px] font-mono rounded-full bg-indigo-50 text-indigo-600 px-2 py-1 h-fit">+120 XP</span></div><div className="flex gap-3 mt-7"><span className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500">✦</span><div className="flex-1"><div className="flex justify-between text-[10px] mb-2"><b>Cause 70% fatigue</b><span className="text-slate-400">0 / 70%</span></div><div className="progress-track"><div className="progress-fill bg-indigo-500" style={{width:'0%'}}/></div></div></div><button onClick={()=>navigate('workout')} className="text-indigo-600 text-[11px] font-bold mt-6">Start today's workout →</button></Panel>
   <Panel><div className="flex justify-between"><div><Kicker>LATEST PROXY SESSION</Kicker><h2 className="text-lg font-extrabold mt-1">Yesterday's damage</h2></div><span className="text-slate-400">•••</span></div><div className="flex items-center gap-3 mt-6"><span className="grid place-items-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500">◒</span><div><b className="block text-xs">Lower body protocol</b><small className="text-[10px] text-slate-400">Squats · Lunges · Wall sit</small></div><span className="ml-auto font-mono text-[10px] text-slate-400">18:42</span></div><div className="flex flex-wrap gap-5 mt-5 text-[10px] text-slate-400"><span><b className="text-slate-700">89%</b> peak fatigue</span><span><b className="text-slate-700">+180</b> XP earned</span><i className="w-full text-pink-400">“I haven't emotionally recovered.”</i></div></Panel>
  </div>
  <div className="grid lg:grid-cols-2 gap-8 mt-9">
   <section><div className="flex justify-between items-end mb-4"><div><Kicker>EXERCISE MASTERY</Kicker><h2 className="text-lg font-extrabold mt-1">How your proxy is progressing</h2></div><button onClick={()=>navigate('profile')} className="text-[10px] text-indigo-600 font-bold">View all →</button></div><div className="space-y-2">{mastery.map(([name,val])=><div key={name} className="surface border border-slate-200 rounded-xl p-3 grid grid-cols-[32px_1fr_42px] gap-3 items-center"><span className="grid place-items-center w-8 h-8 rounded-lg bg-slate-50 text-indigo-500">◒</span><div><div className="flex justify-between"><b className="text-[10px]">{name}</b><span className="font-mono text-[10px] text-slate-400">{val}%</span></div><small className="text-[9px] text-slate-400">{val>80?'Proxy is showing off':'Needs more artificial suffering'}</small><div className="progress-track mt-2"><div className="progress-fill bg-indigo-400" style={{width:`${val}%`}}/></div></div><span/></div>)}</div></section>
   <section><div className="mb-4"><Kicker>CURATED PROTOCOLS</Kicker><h2 className="text-lg font-extrabold mt-1">Pick your poison</h2></div><div className="grid sm:grid-cols-2 gap-2">{playlists.map(p=><button key={p.name} onClick={()=>navigate('workout')} className="surface border border-slate-200 rounded-xl p-3 text-left hover:-translate-y-0.5 transition"><span className={`grid place-items-center w-9 h-9 rounded-lg ${tone[p.tone]}`}>{p.icon}</span><b className="block text-[10px] mt-3">{p.name}</b><small className="block text-[9px] text-slate-400 mt-1">{p.detail}</small></button>)}</div></section>
  </div>
 </section>
}
function Stat({title,value,suffix,note,trend,icon,progress,ring}){return <article className="surface border border-slate-200 bg-white/75 rounded-2xl p-4 min-h-[142px]"><div className="flex justify-between text-[10px] text-slate-500"><span>{title}</span>{trend?<span className="text-emerald-500">{trend}</span>:<span className="grid place-items-center w-7 h-7 rounded-lg bg-slate-50 text-indigo-500">{icon||'↗'}</span>}</div><div className="flex items-end gap-2 mt-5"><strong className="text-3xl tracking-tight">{value}</strong><span className="text-[10px] text-slate-400 mb-1">{suffix}</span>{ring&&<span className="ml-auto grid place-items-center w-12 h-12 rounded-full border-[5px] border-indigo-100 border-t-indigo-500 text-[10px] font-bold text-indigo-500">74%</span>}</div>{progress!==undefined&&<div className="progress-track mt-4"><div className="progress-fill bg-indigo-400" style={{width:`${progress}%`}}/></div>}<small className="block text-[9px] text-slate-400 mt-3">{note}</small></article>}
function Panel({children}){return <article className="surface border border-slate-200 bg-white/75 rounded-2xl p-5 shadow-[0_12px_40px_rgba(35,49,59,.04)]">{children}</article>}
function Kicker({children}){return <span className="text-[8px] font-mono tracking-[.18em] text-slate-400">{children}</span>}

function Workout({workout,setWorkout,rest,setRest,rotation,setRotation,completeRep,skipSet,restart,navigate}){
 const mood=workout.fatigue>75?'Frustrated':workout.fatigue>45?'Annoyed':'Focused'
 const running=workout.active && !workout.paused
 return <section className="px-5 md:px-8 py-8 max-w-[1500px] mx-auto"><div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 mb-6"><div><p className="text-[9px] font-mono tracking-[.2em] text-slate-400">LIVE PROXY SESSION <span className="ml-2 text-emerald-500">● LIVE</span></p><h1 className="text-3xl font-extrabold mt-2">{workout.currentSet>=workout.sets?'Technically, you worked out.':`${workout.exercise} protocol`}</h1><p className="text-sm text-slate-500 mt-2">Your AI is handling the hard part. Please supervise responsibly.</p></div><div className="flex gap-2"><button onClick={()=>setWorkout(w=>({...w,paused:!w.paused,active:w.paused}))} className="soft rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold">{workout.paused?'▶ Resume':'Ⅱ Pause'}</button><button onClick={()=>navigate('dashboard')} className="rounded-xl border border-rose-200 bg-rose-50 text-rose-500 px-4 py-2.5 text-xs font-bold">End session</button></div></div>
 <div className="grid xl:grid-cols-[1fr_390px] gap-4">
  <Panel><div className="stage-bg relative h-[520px] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/60 border border-slate-200"><div className="absolute inset-0 noise opacity-60"/><div className="absolute left-5 top-5 right-5 flex justify-between z-10"><span className="rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-[8px] font-mono tracking-widest text-indigo-500">{running?`ACTIVE / ${workout.exercise.toUpperCase()}`:workout.currentSet>=workout.sets?'PROTOCOL COMPLETE':'IDLE / AWAITING ORDERS'}</span><span className="rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-[8px] font-mono text-slate-500">SET {Math.min(workout.currentSet+1,workout.sets)} / {workout.sets}</span></div><div className="absolute inset-0 grid place-items-center"><Avatar running={running} fatigue={workout.fatigue} rotation={rotation}/></div><div className="absolute left-1/2 -translate-x-1/2 bottom-24 bg-white rounded-2xl shadow-lg px-4 py-3 text-[11px] text-slate-600 max-w-[270px] text-center">“{workout.currentSet>=workout.sets?'We survived. You did nothing. Incredible teamwork.':workout.fatigue>65?pick('fatigue'):running?pick('rep'):pick('idle')}”</div><div className="absolute bottom-5 left-5 right-5 flex justify-between items-center"><span className="text-[9px] text-slate-500"><i className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"/>{workout.paused?'AI is on an unauthorized break':running?'AI is performing the selected protocol':'AI is pretending to stretch'}</span><div className="flex gap-1"><button onClick={()=>setRotation(rotation-.35)} className="w-8 h-8 rounded-lg border bg-white/80">↶</button><button onClick={()=>setRotation(rotation+.35)} className="w-8 h-8 rounded-lg border bg-white/80">↷</button></div></div></div></Panel>
  <div className="space-y-4"><Panel><div className="flex justify-between"><div><Kicker>AI TELEMETRY</Kicker><h2 className="font-extrabold mt-1">Internal damage</h2></div><span className="text-[9px] text-emerald-500">● tracking</span></div><div className="space-y-5 mt-6">{[['Energy',workout.energy,'bg-emerald-400'],['Fatigue',workout.fatigue,'bg-orange-400'],['Stress',workout.stress,'bg-pink-400'],['Performance',workout.performance,'bg-indigo-400']].map(([n,v,c])=><div key={n}><div className="flex justify-between text-[10px] mb-2"><span>{n}</span><b className="font-mono text-slate-500">{Math.round(v)}</b></div><div className="progress-track"><div className={`progress-fill ${c}`} style={{width:`${v}%`}}/></div></div>)}</div><div className="border-t mt-5 pt-4 text-[9px] text-slate-400">◎ Psychological metrics unlocked: mood is <b className="text-pink-400">{mood}</b>.</div></Panel>
  <Panel><div className="flex justify-between"><Kicker>CURRENT PROTOCOL</Kicker><b className="text-xs">{workout.exercise}</b></div><div className="mt-5"><strong className="text-5xl tracking-tighter">{workout.currentSet>=workout.sets?workout.reps:workout.currentRep}</strong><span className="text-[10px] text-slate-400 ml-2">/ {workout.reps} reps</span></div><div className="flex gap-2 mt-5"><button onClick={skipSet} className="soft flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-[10px] font-bold">Skip set</button>{workout.currentSet>=workout.sets?<button onClick={restart} className="flex-1 rounded-xl bg-indigo-600 text-white px-3 py-3 text-[10px] font-bold">Start again →</button>:<button onClick={completeRep} disabled={!running} className="flex-1 rounded-xl bg-indigo-600 disabled:opacity-40 text-white px-3 py-3 text-[10px] font-bold">Complete rep</button>}</div><div className="flex justify-between border-t mt-5 pt-4 text-[9px] text-slate-400"><span>Rest between sets</span><select value={rest} onChange={e=>setRest(Number(e.target.value))} className="bg-transparent"><option>12</option><option>20</option><option>30</option></select></div></Panel></div>
 </div></section>
}
function Avatar({running,fatigue,rotation}){
 const mount=React.useRef(null)
 const scene=React.useRef(null)
 const [zoom,setZoom]=useState(1)
 const [dragging,setDragging]=useState(false)
 const [yaw,setYaw]=useState(rotation*.65)

 useEffect(()=>setYaw(rotation*.65),[rotation])
 useEffect(()=>{
  if(!mount.current) return
  const width=mount.current.clientWidth, height=mount.current.clientHeight
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.setSize(width,height); renderer.shadowMap.enabled=true
  renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15; mount.current.appendChild(renderer.domElement)
  const world=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(28,width/height,.1,100); camera.position.set(0,1.9,6.2)
  world.add(new THREE.HemisphereLight(0xe9f1ff,0x182238,2.1))
  const key=new THREE.DirectionalLight(0xfff3e8,4.2); key.position.set(3,5,4); key.castShadow=true; key.shadow.mapSize.set(1024,1024); world.add(key)
  const rim=new THREE.PointLight(0x79f2d0,9,7); rim.position.set(-3,2.4,2); world.add(rim)
  const fill=new THREE.PointLight(0xff8fbe,5,6); fill.position.set(2,-.2,2); world.add(fill)
  const root=new THREE.Group(); root.position.y=-1.25; world.add(root)
  const material=(color,roughness=.65,metalness=.05)=>new THREE.MeshStandardMaterial({color,roughness,metalness})
  const navy=material(0x3347a5,.52,.18), dark=material(0x1c2740,.48,.28), skin=material(0xd69a7b,.7), skinDark=material(0x9b5d4d,.76), hair=material(0x202335,.5,.1), white=material(0xf7fbff,.3), glow=material(0x79f2d0,.22,.55)
  const mesh=(geometry,mat,position,scale)=>{const item=new THREE.Mesh(geometry,mat); item.position.set(...position); if(scale)item.scale.set(...scale); item.castShadow=true; root.add(item); return item}
  const torso=mesh(new THREE.CapsuleGeometry(.58,.82,10,20),navy,[0,1.72,0],[1,.92,.62])
  mesh(new THREE.SphereGeometry(.48,24,16),dark,[0,1.16,0],[1,.5,.66])
  mesh(new THREE.CylinderGeometry(.18,.2,.22,16),skin,[0,2.47,0])
  const head=mesh(new THREE.SphereGeometry(.47,24,18),skin,[0,2.93,0],[.96,1.08,.9])
  mesh(new THREE.SphereGeometry(.5,20,12,0,Math.PI*2,0,Math.PI*.48),hair,[0,3.02,-.02],[1,1,.96])
  mesh(new THREE.SphereGeometry(.1,12,8),skin,[.48,2.94,0],[.55,1,1]); mesh(new THREE.SphereGeometry(.1,12,8),skin,[-.48,2.94,0],[.55,1,1])
  mesh(new THREE.SphereGeometry(.055,12,8),white,[-.17,2.98,.425]); mesh(new THREE.SphereGeometry(.055,12,8),white,[.17,2.98,.425])
  mesh(new THREE.SphereGeometry(.022,8,6),dark,[-.17,2.98,.474]); mesh(new THREE.SphereGeometry(.022,8,6),dark,[.17,2.98,.474])
  mesh(new THREE.ConeGeometry(.08,.18,12),skinDark,[0,2.84,.46],[1,1,.7]).rotation.x=Math.PI/2
  mesh(new THREE.TorusGeometry(.1,.018,8,16,Math.PI),skinDark,[0,2.72,.45],[1,.7,1]).rotation.x=Math.PI
  mesh(new THREE.BoxGeometry(.34,.075,.05),glow,[0,2.99,.44],[1,1,1])
  const leftArm=mesh(new THREE.CapsuleGeometry(.14,.78,8,14),navy,[-.71,1.78,0],[1,1,1]); leftArm.rotation.z=-.14
  const rightArm=mesh(new THREE.CapsuleGeometry(.14,.78,8,14),navy,[.71,1.78,0],[1,1,1]); rightArm.rotation.z=.14
  mesh(new THREE.SphereGeometry(.17,16,10),navy,[-.73,1.35,0]); mesh(new THREE.SphereGeometry(.17,16,10),navy,[.73,1.35,0])
  const leftLeg=mesh(new THREE.CapsuleGeometry(.19,1.02,8,14),dark,[-.3,.55,0],[1,1,1]); const rightLeg=mesh(new THREE.CapsuleGeometry(.19,1.02,8,14),dark,[.3,.55,0],[1,1,1])
  mesh(new THREE.SphereGeometry(.22,16,10),dark,[-.3,.05,.04],[1,.6,1.35]); mesh(new THREE.SphereGeometry(.22,16,10),dark,[.3,.05,.04],[1,.6,1.35])
  mesh(new THREE.TorusGeometry(.92,.025,8,48),glow,[0,.03,0],[1,1,.62])
  const floor=new THREE.Mesh(new THREE.CircleGeometry(1.15,48),new THREE.MeshStandardMaterial({color:0x91a7ff,roughness:.82,metalness:.05,transparent:true,opacity:.25})); floor.rotation.x=-Math.PI/2; floor.position.y=-.02; floor.scale.set(1.3,1,1); floor.receiveShadow=true; root.add(floor)
  const resize=()=>{const w=mount.current.clientWidth,h=mount.current.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h)}
  window.addEventListener('resize',resize); scene.current={renderer,world,camera,root,torso,leftArm,rightArm,leftLeg,rightLeg}
  let frame=0; const animate=()=>{frame=requestAnimationFrame(animate); const t=frame/60; root.rotation.y=yaw; const bob=running?Math.sin(t*5)*.045:Math.sin(t)*.012; root.position.y=-1.25+bob; torso.rotation.x=running?Math.sin(t*5)*.04:0; leftArm.rotation.x=running?Math.sin(t*5)*.45:0; rightArm.rotation.x=running?-Math.sin(t*5)*.45:0; leftLeg.rotation.x=running?-Math.sin(t*5)*.18:0; rightLeg.rotation.x=running?Math.sin(t*5)*.18:0; renderer.render(world,camera)}; animate()
  return()=>{cancelAnimationFrame(frame); window.removeEventListener('resize',resize); renderer.dispose(); mount.current?.removeChild(renderer.domElement); scene.current=null}
 },[running])
 useEffect(()=>{if(scene.current){scene.current.root.rotation.y=yaw; scene.current.camera.position.z=6.2/zoom}},[yaw,zoom])
 const pointerDown=e=>{setDragging(true); e.currentTarget.setPointerCapture(e.pointerId)}
 const pointerMove=e=>{if(dragging)setYaw(v=>v+e.movementX*.012)}
 return <div className="three-avatar relative w-full max-w-[430px] h-[380px]" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={()=>setDragging(false)} onPointerLeave={()=>setDragging(false)} onWheel={e=>setZoom(v=>Math.max(.82,Math.min(1.3,v-e.deltaY*.0008)))}>
  <div ref={mount} className="three-shell absolute inset-0"/><div className="absolute right-3 top-2 text-[8px] font-mono text-indigo-400">FATIGUE {Math.round(fatigue)}%</div><div className="absolute left-3 bottom-2 rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-[8px] font-mono tracking-widest text-slate-500 backdrop-blur">DRAG TO ROTATE · SCROLL TO ZOOM</div>
 </div>
}

function WorkoutModal({custom,setCustom,setModal,begin}){return <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm grid place-items-center p-5"><div className="surface relative w-full max-w-xl rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl"><button onClick={()=>setModal(false)} className="absolute right-5 top-4 text-xl text-slate-400">×</button><Kicker>BUILD A PROTOCOL</Kicker><h2 className="text-2xl font-extrabold mt-2">How useless should today be?</h2><p className="text-xs text-slate-500 mt-2">Pick an exercise. Your AI will take responsibility for the suffering.</p><div className="grid grid-cols-3 gap-2 mt-6">{['Jumping jacks','Squats','Sit-ups'].map(ex=><button key={ex} onClick={()=>setCustom(c=>({...c,exercise:ex,reps:ex==='Jumping jacks'?20:ex==='Sit-ups'?15:12}))} className={`rounded-xl border p-3 text-left ${custom.exercise===ex?'border-indigo-400 bg-indigo-50':'border-slate-200'}`}><span className="text-xl">{ex==='Jumping jacks'?'⚡':ex==='Squats'?'◒':'▬'}</span><b className="block text-[10px] mt-2">{ex}</b></button>)}</div><div className="grid grid-cols-3 gap-2 mt-4"><label className="text-[9px] text-slate-400">Exercise<select value={custom.exercise} onChange={e=>setCustom(c=>({...c,exercise:e.target.value}))} className="input mt-1 w-full rounded-lg border bg-slate-50 p-2.5 text-xs text-slate-700"><option>Jumping jacks</option><option>Squats</option><option>Push-ups</option><option>Sit-ups</option><option>Lunges</option><option>Plank</option></select></label><label className="text-[9px] text-slate-400">Reps<input type="number" min="1" max="100" value={custom.reps} onChange={e=>setCustom(c=>({...c,reps:Number(e.target.value)}))} className="input mt-1 w-full rounded-lg border bg-slate-50 p-2.5 text-xs"/></label><label className="text-[9px] text-slate-400">Sets<input type="number" min="1" max="10" value={custom.sets} onChange={e=>setCustom(c=>({...c,sets:Number(e.target.value)}))} className="input mt-1 w-full rounded-lg border bg-slate-50 p-2.5 text-xs"/></label></div><button onClick={()=>begin({...custom,name:'CUSTOM PROTOCOL'})} className="mt-5 w-full rounded-xl bg-indigo-600 text-white py-3 text-xs font-bold">Launch protocol →</button></div></div>}

function Profile({state,setState}){const history=state.history.length?state.history:[{exercise:'Lower body protocol',date:'Yesterday',score:'+180 XP'},{exercise:'Quick burn',date:'Sep 09 · 8 min',score:'+120 XP'}]; return <section className="px-5 md:px-8 py-8 max-w-[1200px] mx-auto"><div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"><div><Kicker>OPERATOR PROFILE</Kicker><h1 className="text-3xl font-extrabold mt-2">{state.name}'s command center</h1><p className="text-sm text-slate-500 mt-2">The human behind the proxy. No physical exertion detected.</p></div><button onClick={()=>{const n=prompt('Operator name',state.name); if(n?.trim())setState(s=>({...s,name:n.trim()}))}} className="soft rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold">Edit profile</button></div><Panel><div className="flex flex-wrap items-center gap-5"><div className="grid place-items-center w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 text-3xl font-extrabold relative">{state.name[0]}<span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"/></div><div className="flex-1 min-w-[220px]"><Kicker>PROXY OPERATOR · LEVEL {String(state.level).padStart(2,'0')}</Kicker><h2 className="text-xl font-extrabold mt-1">{state.name}</h2><p className="text-[11px] text-slate-500 mt-1">Goal: {state.goal} · Since Jan 2026</p><div className="flex items-center gap-2 mt-4 max-w-md"><span className="text-[9px] font-mono text-slate-400">{state.xp} XP</span><div className="progress-track flex-1"><div className="progress-fill bg-indigo-500" style={{width:`${Math.min(100,state.xp/20)}%`}}/></div><span className="text-[9px] font-mono text-slate-400">2,000 XP</span></div></div><div className="flex gap-8"><div><b className="text-xl">{state.streak}</b><span className="block text-[9px] text-slate-400">streak</span></div><div><b className="text-xl">{27+state.history.length}</b><span className="block text-[9px] text-slate-400">workouts</span></div><div><b className="text-xl">{state.score}</b><span className="block text-[9px] text-slate-400">score</span></div></div></div></Panel><div className="grid md:grid-cols-2 gap-4 mt-4"><Panel><Kicker>BADGES</Kicker><div className="grid grid-cols-2 gap-2 mt-5">{['First Rep','7 Day Streak','Proxy Veteran','No Sweat'].map((b,i)=><div key={b} className={`rounded-xl border p-4 text-center ${i===3?'opacity-40':''}`}><span className="grid place-items-center w-9 h-9 mx-auto rounded-xl bg-orange-50 text-orange-500">✦</span><b className="block text-[10px] mt-2">{b}</b><small className="text-[9px] text-slate-400">{i===3?'Locked':'Unlocked'}</small></div>)}</div></Panel><Panel><Kicker>SESSION HISTORY</Kicker><div className="mt-3">{history.slice(0,5).map((h,i)=><div key={i} className="flex items-center gap-3 border-b last:border-0 border-slate-100 py-3"><span className="grid place-items-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500">◒</span><div><b className="block text-[10px]">{h.exercise}</b><small className="text-[9px] text-slate-400">{h.date}</small></div><span className="ml-auto text-[10px] font-mono text-emerald-500">{h.score}</span></div>)}</div></Panel></div></section>}

createRoot(document.getElementById('root')).render(<App />)
