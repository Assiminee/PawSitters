// import React from 'react'
import hero from "../assets/images/what-to-consider-when-looking-for-a-pet-sitter.jpeg"
// import logo from "../assets/images/large_3-no_bg.png"

function HeroSection() {
  return (
    <section className='relative flex h-screen items-center justify-center'>
      <div className="absolute inset-0 -z-20 h-full w-full overflow-hidden">
        <img src={hero} alt="" className="h-full w-full object-cover"/>
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-70% to-slate-950">
      </div>
      {/* <div className="absolute inset-0 -z-10 bg-gradient-to-t from-transparent from-70% to-slate-50">
      </div> */}
      <div className="relative z-20 flex h-screen flex-col justify-center pb-20">
        {/* <img src={logo} alt="PawSitters" className="w-full p-4"/> */}
        <div className="">
          <span className={`text-8xl text-indigo-800 {/*text-[1.6875rem]/[2rem]*/} tracking-tighter text-white font-semibold`}>Caring Sitters for Every Pet</span>
          <span className={`text-5xl text-indigo-600 {/*text-[1.6875rem]/[2rem]*/} tracking-tighter text-slate-800 font-semibold block`}>—Peace of Mind for Every Owner</span>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
