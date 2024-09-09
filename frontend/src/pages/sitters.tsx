import Header from '../components/header'
import '../assets/css/sitters.css'
import { useRef } from 'react'

function Sitters() {

  let scrollRef = useRef<HTMLDivElement>(null);
  const scrollRefBr = useRef<HTMLDivElement>(null);
  const childWidth = 239;

  const scrollRight = (e: HTMLDivElement | null) => {
    e?.scrollBy({
      left: childWidth,
      behavior: 'smooth',
    })
  }

  const scrollLeft = (e: HTMLDivElement | null) => {
    e?.scrollBy({
      left: -childWidth,
      behavior: 'smooth',
    })
  }
  return (
    <div className='bg-slate-100 h-full'>
      <Header></Header>
      <div className='md:grid grid-cols-8 font-body text-gray-600 bg-slate-100 max-w-5xl mx-auto'>
        <div className='md:col-span-2'>
          <div className='bg-white rounded m-2 mt-4'>
            <article className='border-b border-gray-300 p-2'>
              <h2 className='font-semibold uppercase'>Location</h2>
              <div className="flex-shrink flex-grow flex-basis-0 min-w-0 py-1.5 px-0">
                <div className="flex items-center max-w-none mx-0 py-4 px-6">
                  <div className='w-full'>
                    <label htmlFor="search" className='absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap'>
                      City
                    </label>
                    <div className='relative'>
                      <div className='flex absolute items-center pl-3 left-0 top-0 bottom-0 pointer-events-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="block align-middle size-6 text-opacity-100 w-5 h-5 ">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                      </div>
                      <input id='search_filter' type="search" placeholder='Search' className='block text-sm ring-opacity-100 ring-gray-300 ring-inset text-opacity-100 pr-3 pl-10 py-1.5 bg-opacity-100 border-2 rounded-md w-full focus:outline-indigo-600'/>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            <section className='relative border-b border-gray-300 p-2'>
              <h2 className='font-semibold uppercase'>Fee</h2>
              <span className='absolute top-0 right-0 font-bold mt-2 mr-2 text-indigo-800 uppercase text-sm'>
                <a href="#">
                  Apply
                </a>
              </span>
              <div className='flex w-full items-center py-5'>
                <div className='flex p-2 h-8 w-full items-center border'>
                  <input type="number" name='min' placeholder='Min' className='h-8 min-w-0 text-sm w-full bg-transparent outline-none m-0 overflow-clip '/>
                </div>
                <div className='flex p-2 h-8 w-full items-center border'>
                  <input type="number" name='max' placeholder='Max' className='h-8 min-w-0 text-sm w-full bg-transparent outline-none m-0 overflow-clip '/>
                </div>
              </div>
            </section>
            <article className='p-2'>
              <h2 className='font-semibold uppercase'>Rating</h2>
              <div className='py-5'>
                <div className="flex items-center">

                  <input id="quadstar" name="notification-method" type="radio" className="text-opacity-100 border-opacity-100 w-4 h-4 rounded-full mr-1.5"/>
                  <img src="./src/assets/images/quadstar.png" alt="" className='h-3'/>
                  <label htmlFor="quadstar" className="font-medium text-base block ml-1.5">&amp; above</label>
                </div>
                <div className="flex items-center mt-1.5">
                  <input id="tristar" name="notification-method" type="radio" className="text-opacity-100 border-opacity-100 w-4 h-4 rounded-full mr-1.5"/>
                  <img src="./src/assets/images/tristar.png" alt="" className='h-3'/>
                  <label htmlFor="tristar" className="font-medium text-base block ml-1.5">&amp; above</label>
                </div>
                <div className="flex items-center mt-1.5">
                  <input id="duostar" name="notification-method" type="radio" className="text-opacity-100 border-opacity-100 w-4 h-4 rounded-ful mr-1.5"/>
                  <img src="./src/assets/images/duostar.png" alt="" className='h-3'/>
                  <label htmlFor="duostar" className="font-medium text-base block ml-1.5">&amp; above</label>
                </div>
                <div className="flex items-center mt-1.5">
                  <input id="lonestar" name="notification-method" type="radio" className="text-opacity-100 border-opacity-100 w-4 h-4 rounded-full mr-1.5"/>
                  <img src="./src/assets/images/lonestar_crop.png" alt="" className='h-3'/>
                  <label htmlFor="lonestar" className="font-medium text-base block ml-1.5">&amp; above</label>
                </div>
              </div>
            </article>
          </div>
        </div>
        <main className='md:col-span-6'>
          <div className='m-2 mt-4 bg-white rounded'>
            <div className='overflow-hidden'>
              <div className='flex items-center px-4 border-b border-gray-200'>
                <h4 className="font-semibold text-xl py-4">Best Rated</h4>
              </div>
              <div className='wrapper'>
                <div className='card-wrapper grid grid-flow-col' ref={scrollRefBr}>
                  <button className='absolute top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center bg-gray-900 bg-opacity-50 text-xl z-10 left-0 hover:bg-opacity-75 ml-1 rounded-md' onClick={() => scrollLeft(scrollRefBr.current)}>
                    <i>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-300 bg-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    </i>
                  </button>
                  <button className='absolute top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center bg-gray-900 bg-opacity-50 text-xl z-10 right-0 hover:bg-opacity-75 mr-1 rounded-md' onClick={() => scrollRight(scrollRefBr.current)}>
                    <i>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-300 bg-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    </i>
                  </button>
                  {/* Cards here */}
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                </div>
              </div>
            </div>

            <div className='overflow-hidden'>
              <div className='flex items-center px-4 border-b border-gray-200'>
                <h4 className="font-semibold text-xl py-4">Most Experienced</h4>
              </div>
              <div className='wrapper'>
                <div className='card-wrapper grid grid-flow-col' ref={scrollRef}>
                  <button className='absolute top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center bg-gray-900 bg-opacity-50 text-xl z-10 left-0 hover:bg-opacity-75 ml-1 rounded-md' onClick={() => scrollLeft(scrollRef.current)}>
                    <i>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-300 bg-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    </i>
                  </button>
                  <button className='absolute top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center bg-gray-900 bg-opacity-50 text-xl z-10 right-0 hover:bg-opacity-75 mr-1 rounded-md' onClick={() => scrollRight(scrollRef.current)}>
                    <i>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 text-gray-300 bg-none">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    </i>
                  </button>
                  {/* Cards here */}
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  <article className='card'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                </div>
              </div>
            </div>

            <div className='overflow-hidden'>
              <div className='flex items-center px-4 border-b border-gray-200'>
                <h4 className="font-semibold text-xl py-4">All</h4>
              </div>
              <div className=''>
                <div className='flex flex-wrap gap-1 p-1'>
                  {/* Cards here */}
                  <article className='card card-all'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>

                  <article className='card card-all'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>

                  <article className='card card-all'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>

                  <article className='card card-all'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>

                  <article className='card card-all'>
                    <a href="#">
                      <div className='overflow-hidden mb-1'>
                        <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" className='h-32 w-full sm:h-48 object-cover'/>
                      </div>
                      <div className='px-2'>
                        <h3 className='font-semibold'>User name</h3>
                        <span className='text-gray-500 text-sm'>City</span>
                        <span className='block text-lg font-bold'>Fee</span>

                      </div>
                      <div className='badge'>
                        <span>13 exp</span>
                      </div>
                    </a>
                  </article>
                  
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default Sitters
