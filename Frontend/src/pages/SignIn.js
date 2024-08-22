import React, { useState } from "react";

const SignIn = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let errors = {};
  
    // Name validation
    const namePattern = /^[A-Za-z\s]+$/;
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (!namePattern.test(formData.name)) {
      errors.name = "Name can only contain letters and spaces";
    }
  
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      errors.email = "Email is not valid";
    }
  
    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
  
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validate()) {
      try {
        const data = await fetch("http://localhost:3001/api/v1/createuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const response = await data.json();
        console.log(response);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 text-gray-900 flex justify-center items-center">
        <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow-lg sm:rounded-lg flex justify-center flex-1 transform transition-all duration-500 ease-in-out hover:scale-105">
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-3xl xl:text-4xl font-extrabold text-indigo-600">Sign Up</h1>
              <p className="text-sm text-gray-500 mt-2">Join us and explore the amazing features!</p>
              <div className="w-full flex-1 mt-8">
                <div className="my-12 border-b text-center"></div>
                <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                  <input
                    className="w-full px-8 py-4 my-3 rounded-lg font-medium bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-300 ease-in-out transform focus:scale-105"
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
                  
                  <input
                    className="w-full px-8 py-4 my-3 rounded-lg font-medium bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-300 ease-in-out transform focus:scale-105"
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
                  
                  <input
                    className="w-full px-8 py-4 my-3 rounded-lg font-medium bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-300 ease-in-out transform focus:scale-105"
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
                  
                  <button
                    type="submit"
                    className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none transform hover:scale-105"
                  >
                    <svg
                      className="w-6 h-6 -ml-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy={7} r={4} />
                      <path d="M20 8v6M23 11h-6" />
                    </svg>
                    <span className="ml-3">Sign Up</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  'url("https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg")',
              }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
