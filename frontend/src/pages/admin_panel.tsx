import { useState } from 'react'
import DeleteRecord from '../components/delete_record';
import UpdateRecord from '../components/update_record';

function AdminPanel() {
  const [isHidden, setIsHidden] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [IsModalVisible, setIsModalVisible] = useState(false);

  const toggleMenu = () => { 
    setIsHidden(!isHidden);
  }

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsModalVisible(true);
  }

  return (
    <>
      <div className='md:grid grid-cols-10 font-body text-gray-600'>
        <div className='md:col-span-2 bg-slate-100'>
          <nav>
            <div className='flex justify-between items-center'>
              <h1 className='text-3xl p-5 border-b border-b-gray-300 text-center'>
                <a href="/">PawSitters</a>
              </h1>
              <div className='px-4 cursor-pointer md:hidden' onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <ul className={`font-semibold text-gray-500 mt-5 md:block ${isHidden ? '' : 'hidden'}`}>
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
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Certification</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Pet</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Breed</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Species</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Booking</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Payment</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Review</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>User Images</span>
                </a>
              </li>
              <li className='py-1'>
                <a href="#" className='px-4'>
                  <span>Pet Images</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <main className='md:col-span-8 px-12 py-5 bg-slate-50'>
          <header className='text-4xl'>
            <h2>Admin Panel</h2>
          </header>
          <div className='flex justify-between mt-12'>
            <div>
              <form>
                <div className='flex border-2 rounded-md overflow-hidden bg-white'>
                  <select className='w-4 h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm'>
                    <option value="all">All</option>
                    <option value="option1">Column1</option>
                    <option value="option2">Column2</option>
                  </select>
                  <input className='focus:outline-none' type="text" placeholder='Search'/>
                  <a href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
                    </svg>
                  </a>
                </div>
              </form>
            </div>
            <div className='border-2 border-green-600 text-green-600 flex rounded px-1 py-0.5 font-bold tracking-wider hover:text-white hover:cursor-pointer hover:bg-green-600 hover:shadow-lg'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current mt-0.5">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clip-rule="evenodd" />
              </svg>
              <a href="#">Add</a>
            </div>
          </div>
          <div className='flex justify-between p-1.5 text-sm font-semibold bg-blue-950 text-white mt-4 rounded-t-lg'>
            <h4>Users</h4>
            <output>Result</output>
          </div>
          <div className='border border-gray-300 rounded-b-lg overflow-hidden bg-white shadow-sm'>
            <table className='block overflow-x-auto whitespace-nowrap table-auto text-left text-sm'>
              <thead className='border-b border-gray-300'>
                <tr>
                  <th>Column1</th>
                  <th>Column2</th>
                  <th>Column3</th>
                  <th>Column4</th>
                  <th>Column5</th>
                  <th>Column6</th>
                  <th className=''>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-gray-200'>
                  <td>Rec1</td>
                  <td>Even Longer Record 1</td>
                  <td>Rec1</td>
                  <td>Rec1</td>
                  <td>Rec1</td>
                  <td>Rec1</td>
                  <td className='flex justify-around'>
                    <a href="#" onClick={handleEditClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-green-600">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </a>
                    <a href="#" onClick={handleDeleteClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-red-600">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr className='border-b border-gray-200'>
                  <td>Rec2</td>
                  <td>Rec2</td>
                  <td>Even Longer Record 2</td>
                  <td>Rec2</td>
                  <td>Rec2</td>
                  <td>Rec2</td>
                  <td className='flex justify-around'>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-green-600">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-red-600">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr className='border-b border-gray-200'>
                  <td>Rec3</td>
                  <td>Rec3</td>
                  <td>Rec3</td>
                  <td>Even Longer Record 3</td>
                  <td>Rec3</td>
                  <td>Rec3</td>
                  <td className='flex justify-around'>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-green-600">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-red-600">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr className='border-b border-gray-200'>
                  <td>Rec4</td>
                  <td>Rec4</td>
                  <td>Rec4</td>
                  <td>Rec4</td>
                  <td>Even Longer Record 4</td>
                  <td>Rec4</td>
                  <td className='flex justify-around'>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-green-600">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-red-600">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Even Longer Record 5</td>
                  <td>Rec5</td>
                  <td>Rec5</td>
                  <td>Rec5</td>
                  <td>Rec5</td>
                  <td>Rec6</td>
                  <td className='flex justify-around'>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-green-600">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5 fill-current text-red-600">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <DeleteRecord open={isModalOpen} setOpen={setIsModalOpen}/>
      <UpdateRecord open={IsModalVisible} setOpen={setIsModalVisible}/>
    </>
  )
}

export default AdminPanel
