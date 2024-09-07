import React from 'react';

const Footer = () => {
    return (
        <footer className="flex flex-col items-left justify-center p-4 bg-gray-800 text-white text-center ">
            <div className="items-center justify-center w-full md:w-auto">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} Your Company. All rights reserved.
                </p>
            </div>

            {/* Company Tagline */}
            <div className="mt-2">
                <p className="text-xs">
                    Powered by JQG-Ventures S.A
                </p>
            </div>
        </footer>
    );
};

export default Footer;
