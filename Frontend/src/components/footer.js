import { FaWhatsapp, FaFacebook, FaGithub, FaYoutube, FaTwitter, FaLinkedin } from "react-icons/fa";
import React from 'react';

const Footer = () => {
    return (
        <footer className="my-4 rounded-lg border-t-4 border-blue-500 shadow-lg w-full px-6 py-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Logo and Tagline */}
                <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h1 className="cursor-pointer text-[32px] font-extrabold">
                        Crypto<span className="text-yellow-400">Tracker</span>
                    </h1>
                    <p className="mt-2 text-sm">Your gateway to the crypto world</p>
                </div>

                {/* Social Media Icons */}
                <div className="flex gap-4 text-[30px]">
                    <a href="tel:+91 9452100940" className="transition transform hover:scale-110 hover:text-green-500">
                        <FaWhatsapp className="text-green-400" />
                    </a>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110 hover:text-blue-500">
                        <FaFacebook className="text-blue-300" />
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110 hover:text-red-500">
                        <FaYoutube className="text-red-400" />
                    </a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110 hover:text-gray-300">
                        <FaGithub className="text-white" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110 hover:text-blue-400">
                        <FaTwitter className="text-blue-300" />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="transition transform hover:scale-110 hover:text-blue-600">
                        <FaLinkedin className="text-blue-400" />
                    </a>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

{/* Newsletter Subscription and Contact */}
<div className="flex flex-col md:flex-row justify-between items-center">
    {/* Newsletter Subscription */}
    <div className="mb-4 md:mb-0 text-center md:text-left">
        <h2 className="text-[20px] font-bold">Subscribe to our Newsletter</h2>
        <form 
            className="mt-2 flex"
            onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.elements.email.value;
                alert(`Subscribed by this email: ${email}`);
            }}
        >
            <input
                type="hidden"
                name="token"
                value="your-csrf-or-other-token-value"
            />
            <input
                type="email"
                name="email" // Added name attribute to access the input value
                placeholder="Enter your email"
                className="rounded-l-lg p-2 w-full md:w-72 text-gray-800"
            />
            <button
                type="submit"
                className="bg-yellow-400 text-white p-2 rounded-r-lg hover:bg-yellow-500 transition"
            >
                Subscribe
            </button>
        </form>
    </div>

                {/* Contact Information */}
                <div className="text-center md:text-right">
                    <p className="text-sm">© 2024 CryptoTracker. All rights reserved.</p>
                    <p className="text-sm">1234 Crypto Street, Blockchain City, CT 56789</p>
                    <p className="text-sm">Email: support@cryptotracker.com</p>
                    <p className="text-sm">Phone: +91 9452100940</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
