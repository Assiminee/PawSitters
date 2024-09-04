import Header from '../components/header'

function Sitters() {
  return (
    <div className='bg-slate-100 h-full'>
      <Header></Header>
      <div className='md:grid grid-cols-8 font-body text-gray-600 bg-slate-100 max-w-5xl mx-auto'>
        <div className='md:col-span-2 bg-white m-2 mt-4 rounded'>
          <nav>
            <ul className={`font-semibold text-gray-500 mt-5 md:block`}>
              <li className='py-1 border-r-8 border-blue-950'>
                <a href="#" className='px-4'>
                  <span>User</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Address</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Role</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <main className='md:col-span-6'>
          <div className='m-2 mt-4 bg-white rounded'>
            <div className='overflow-hidden'>
              <div className='flex items-center px-4'>
                <h4 className="font-semibold text-xl py-4">Best Rated</h4>
              </div>
              <div>
                {/* Cards here */}
                <div>
                  <img src="./src/assets/images/little-dog-with-owner-playing-having-fun-young-teen-girl-sitting-couch-with-her-pet_941451-2770.jpg" alt="" />
                  <div>
                    <span>User Name</span>
                    <span>City</span>
                    <span>Fee</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='overflow-hidden'>
              <div className='flex items-center px-4 border-b border-gray-400'>
                <h4 className="font-semibold text-xl py-4">Most Experienced</h4>
              </div>
              <div>
                {/* Cards here */}
                <div>
                  <img src="./src/assets/images/depositphotos_531343490-stock-video-young-teenage-girl-relaxing-in.jpg" alt="" />
                  <div>
                    <span>User Name</span>
                    <span>City</span>
                    <span>Fee</span>
                  </div>
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
