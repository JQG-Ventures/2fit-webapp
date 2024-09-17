'use client';

import React from 'react';

const Footer = () => {
    return (
        <footer className="flex flex-col items-center justify-center p-4 bg-gray-800 text-white text-center">
            <div className="w-full md:w-auto">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} 2Fit AI. All rights reserved.
                </p>
            </div>

            <div className="mt-2">
                <p className="text-xs">
                    Powered by JQG-Ventures S.A
                </p>
            </div>
        </footer>
    );
};

export default Footer;
