import React, { useState } from "react";

function SignUpInputs(props: any) {
    const [focused, setFocused] = useState(false);
    const {label, errorMessage, onChange, id, ...inputProps} = props;

    const handleFocus = (e: React.FocusEventHandler<HTMLInputElement>) => {
      setFocused(true);
    }
  return (
    <div className='bg-slate-300 border-b border-white px-2 py-1'>
      <label className='block text-sm text-gray-600 font-semibold'>{label}</label>
      <input
        {...inputProps}
        className='signup_fields'
        onChange={onChange}
        onBlur={handleFocus}
        onFocus={() => inputProps.name === "confirmPassword" && setFocused(true)}
        focused={focused.toString()}
        autoComplete="off"/>
      <span className="error text-[0.688rem] text-red-500 hidden">{errorMessage}</span>
    </div>
  )
}

export default SignUpInputs