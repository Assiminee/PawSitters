import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import React, { useState } from 'react';
import SignUpInputs from './sign_up_inputs';

interface SignUpProp {
    open: boolean;
    setOpen: (open: boolean) => void;
}

function SignUp({open, setOpen}: SignUpProp) {

  type FormValues = {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    password: string;
    confirmPassword: string;
  };

  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    password: "",
    confirmPassword: ""
  });

  type InputProps = {
    id: number;
    name: string;
    type: string;
    errorMessage: string;
    label: string;
    pattern?: string;
    required: boolean;
    max?: string;
    min?: string;
  };

  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate() + 1
  );

  const centurytwentyAgo = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate()
  );

  const minBirthDate = centurytwentyAgo.toISOString().split('T')[0];
  const maxBirthDate = eighteenYearsAgo.toISOString().split('T')[0];

  const inputs: InputProps[]  = [
    {
      id: 1,
      name: "firstName",
      type: "text",
      errorMessage: "First name should be at least two characters long and have no special characters",
      label: "First Name",
      pattern: `^[A-Za-z]{2,30}$`,
      required: true,
    },
    {
      id: 2,
      name: "lastName",
      type: "text",
      errorMessage: "Last name should be at least two characters long and have no special characters",
      label: "Last Name",
      pattern: "^[A-za-z]{2,30}$",
      required: true
    },
    {
      id: 3,
      name: "email",
      type: "email",
      errorMessage: "Invalid email",
      label: "Email Address",
      required: true
    },
    {
      id: 4,
      name: "birthDate",
      type: "date",
      errorMessage: "You must be at least 18 years old",
      label: "Date of Birth",
      pattern: "",
      required: true,
      max: maxBirthDate,
      min: minBirthDate
    },
    {
      id: 5,
      name: "password",
      type: "password",
      errorMessage: "Your password must be at least 8 characters long and contain at least an uppercase letter, a number and a special character",
      label: "Password",
      pattern: `^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$`,
      required: true
    },
    {
      id: 6,
      name: "confirmPassword",
      type: "password",
      errorMessage: "Passwords don't match",
      label: "Confirm Password",
      pattern: values.password,
      required: true
    }
  ];

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues({ ...values, [name]: value });
  };

  console.log(values)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOpen(false);
  };

  // const handleButtonClick = () => {
  //   if (formRef.current) {
  //     formRef.current.requestSubmit(); // Trigger form submission
  //   }
  // };
  return (
    <div>
      <Dialog open={open} onClose={setOpen} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white pb-4 pt-5 sm:pl-6  sm:pb-4 overflow-auto">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white sm:mx-0 sm:h-10 sm:w-10 border-2 border-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-primary">
                    <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Sign Up
                  </DialogTitle>
                </div>
              </div>
              <div className='pl-14 pr-16'>
              <div className='flex items-center justify-center bg-slate-100 rounded-full hover:cursor-pointer hover:bg-slate-200 w-fit mx-auto p-1'>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="LgbsSe-Bz112c h-3.5"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                  <a href="#" className='text-sm font-semibold ml-2'>Sign up with Google</a>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='border h-0 w-2/5 px-2'></div>
                  <span className='block my-4 text-center'>or</span>
                  <div className='border h-0 w-2/5 px-2'></div>
                </div>
              </div>
              <div className='px-14 max-h-56 overflow-auto scrollbar'>
                <form action="POST" onSubmit={handleSubmit}>
                  {inputs.map(input=>(
                    <SignUpInputs key={input.id} {...input} value={values[input.name as keyof FormValues]} onChange={onChange}/>
                  ))}

                </form>
              </div>
            </div>
            <div className="bg-slate-100 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex w-full justify-center rounded-md bg-indigo-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 sm:ml-3 sm:w-auto"
              >
                Signup
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    </div>
  )
}

export default SignUp