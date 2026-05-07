import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <div className="bg-white min-h-screen font-sans text-gray-800">
            {/* Hero Section */}
            <section className="relative bg-[#0d1326] text-white pt-24 pb-40 overflow-hidden">
                {/* Abstract Background graphic like AI image */}
                <div className="absolute inset-0 opacity-20 pointer-events-none flex justify-end">
                    <div className="w-[600px] h-[600px] border-[0.5px] border-orange-500/30 rounded-full mt-[-100px] mr-[-100px]"></div>
                    <div className="absolute top-[20%] right-[10%] w-[400px] h-32 bg-orange-500/10 blur-[80px]"></div>
                </div>

                <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">
                    <div className="lg:w-1/2 mb-12 lg:mb-0 z-10">
                        <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight tracking-tight">
                            University <br/>
                            Management <br/>
                            <span className="text-white">Services</span>
                        </h1>
                        <div className="w-16 h-1 bg-[#ff5a2c] mb-6"></div>
                        <p className="text-gray-300 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
                            Our expert platform helps you work closely with coordinators to understand your unique university events and challenges.
                        </p>
                        <Link 
                            to="/events" 
                            className="inline-block bg-[#ff5a2c] hover:bg-[#e0491d] text-white font-bold py-3 px-8 rounded-md transition-colors text-sm uppercase tracking-wider shadow-[0_4px_14px_0_rgba(255,90,44,0.39)]"
                        >
                            BROWSE EVENTS
                        </Link>
                    </div>
                    
                    {/* Illustration mimicking the translucent AI board from the image */}
                    <div className="lg:w-1/2 relative hidden md:flex justify-end pr-10">
                        <div className="w-[400px] h-[300px] border-[0.5px] border-[#ff5a2c]/40 rounded-sm bg-[#ffffff05] backdrop-blur-sm p-6 flex flex-col relative">
                            {/* Decorative grids reminiscent of the reference */}
                            <div className="text-center font-bold tracking-widest text-[#ff5a2c] mb-8 text-xl">
                                UNIEVENTS
                                <p className="text-gray-400 text-xs mt-1 font-normal tracking-normal">Academic Intelligence</p>
                            </div>
                            <div className="flex-1 border border-white/10 p-4 relative">
                                {/* SVG mimicking the head/robot graphic in a stylized way for universities */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Stats Banner */}
            <section className="relative z-20 max-w-[1000px] mx-auto px-6 -mt-[4.5rem]">
                {/* Using a pseudo-element shape to match the curved edge banner in the reference */}
                <div className="bg-[#051139] shadow-2xl rounded-bl-[4rem] rounded-tr-[4rem] px-8 py-10 flex flex-col md:flex-row justify-around items-center border-b-4 border-red-600 relative overflow-hidden">
                    <div className="text-center mb-8 md:mb-0 relative z-10">
                        <div className="flex justify-center mb-4 text-white p-2">
                             <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">50+</h3>
                        <p className="text-[#aeb5d0] text-[11px] uppercase tracking-wider">Specialised Partners</p>
                    </div>
                    
                    <div className="text-center mb-8 md:mb-0 relative z-10">
                        <div className="flex justify-center mb-4 text-white p-2">
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">100%</h3>
                        <p className="text-[#aeb5d0] text-[11px] uppercase tracking-wider">Customer Satisfaction</p>
                    </div>

                    <div className="text-center relative z-10">
                        <div className="flex justify-center mb-4 text-white p-2">
                            <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">1K+</h3>
                        <p className="text-[#aeb5d0] text-[11px] uppercase tracking-wider">Completed Events</p>
                    </div>
                </div>
            </section>

            {/* About Us Complex Section */}
            <section className="max-w-[1200px] mx-auto px-6 py-32 flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-[45%]">
                    <div className="relative">
                        {/* Rounded shapes mimicking reference: Top-left semi curved, etc */}
                        <div className="rounded-tl-[8rem] rounded-tr-[1rem] rounded-bl-[1rem] rounded-br-[8rem] overflow-hidden">
                            <img 
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3EF3mMy_7Y_E-ZiemStZFU1kcT_TS8rmnOA&s" 
                                alt="Professional meeting" 
                                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="md:w-[55%] lg:pl-10">
                    <h2 className="text-[2.5rem] font-bold text-[#051139] mb-4">About Us</h2>
                    <div className="w-16 h-1 rounded bg-[#ff5a2c] mb-8"></div>
                    
                    <p className="text-gray-500 text-base leading-[1.8] mb-8 font-light max-w-lg">
                        Easily plan, organize, and manage academic events with our all-in-one platform. We help universities create seamless and impactful experiences for students and faculty.
                    </p>
                    
                    <Link 
                        to="/signup" 
                        className="inline-block bg-[#ff5a2c] hover:bg-[#e0491d] text-white font-bold py-3 px-8 rounded-full transition-all tracking-wider shadow-[0_5px_15px_-3px_rgba(255,90,44,0.4)] text-[13px]"
                    >
                        JOIN PLATFORM
                    </Link>
                </div>
            </section>

            {/* Services Grid Section (Subtle background pattern) */}
            <section className="bg-gray-50/50 pt-20 pb-32 relative">
                {/* Very faint background dotted texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-16 items-start">
                    
                    <div className="lg:w-[35%] lg:sticky lg:top-32">
                        <h2 className="text-[2.5rem] font-extrabold text-[#051139] leading-[1.1] mb-6">
                            We Provide Best <br /> Services Platform
                        </h2>
                        <div className="w-16 h-1 rounded bg-[#ff5a2c] mb-8"></div>
                        <Link 
                            to="/events" 
                            className="inline-block bg-[#ff5a2c] hover:bg-[#e0491d] text-white font-bold py-3 px-8 rounded-[2rem] transition-colors shadow-md text-[12px] tracking-widest uppercase mt-4"
                        >
                            VIEW ALL EVENTS
                        </Link>
                    </div>

                    <div className="lg:w-[65%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 mt-10 lg:mt-0">
                        
                        {/* Service Item 1 (Highlighted block) */}
                        <div className="bg-[#ff5a2c] text-white p-10 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl shadow-[0_10px_30px_-10px_rgba(255,90,44,0.6)] transform translate-y-6">
                            <div className="mb-6">
                                {/* Using simple SVG paths similar to the reference icon */}
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Platform Offerings</h3>
                            <p className="text-white/80 text-[14px] leading-relaxed font-light">
                                Comprehensive tools for event registration, scheduling, and participant management.
                            </p>
                        </div>

                        {/* Service Item 2 */}
                        <div className="bg-white p-10 rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
                           <div className="mb-6">
                                <svg className="w-12 h-12 text-[#ff5a2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#051139]">Business Process Automation</h3>
                            <p className="text-gray-500 text-[14px] leading-relaxed font-light">
                                Automate ticket approvals, participant verifications, and attendance tracking workflows effortlessly.
                            </p>
                        </div>

                        {/* Service Item 3 */}
                        <div className="bg-white p-10 rounded-tr-[3rem] rounded-br-2xl rounded-tl-2xl rounded-bl-[3rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100">
                           <div className="mb-6">
                                <svg className="w-12 h-12 text-[#ff5a2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#051139]">Secure Implementation</h3>
                            <p className="text-gray-500 text-[14px] leading-relaxed font-light">
                                Safe and reliable role-based access control for students, coordinators, and faculty members.
                            </p>
                        </div>

                         {/* Service Item 4 */}
                         <div className="bg-white p-10 rounded-tl-[3rem] rounded-bl-2xl rounded-tr-2xl rounded-br-[3rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 transform translate-y-6">
                           <div className="mb-6">
                               <svg className="w-12 h-12 text-[#ff5a2c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-[#051139]">Knowledge Centralization</h3>
                            <p className="text-gray-500 text-[14px] leading-relaxed font-light">
                                Keep all your event data, feedback forms, and analytical reports organized in one centralized hub.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
