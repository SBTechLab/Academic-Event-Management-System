const Home = () => {
    return (
        <div className="bg-white">

            {/* ================= HERO SECTION ================= */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
                
                {/* Decorative Background */}
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 opacity-30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-32 text-center">
                    
                    {/* Badge */}
                    <div className="inline-block mb-6 px-5 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                        University Event Management Platform
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto">
                        Simplify Academic Event
                        <span className="block text-blue-600 mt-2">
                            Planning & Coordination
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Manage registrations, approvals, event coordination, and communication 
                        through one centralized and efficient digital platform designed for universities.
                    </p>

                    {/* Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
                        <a 
                            href="/events"
                            className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
                        >
                            Browse Events
                        </a>

                        <a 
                            href="/about"
                            className="px-8 py-3 text-lg font-semibold text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300"
                        >
                            Learn More
                        </a>
                    </div>
                </div>
            </section>


            {/* ================= FEATURES SECTION ================= */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Everything You Need to Manage Events
                    </h2>

                    <p className="text-gray-600 max-w-2xl mx-auto mb-16">
                        Designed for students, faculty, and administrators to collaborate seamlessly.
                    </p>

                    <div className="grid md:grid-cols-3 gap-10">

                        <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Easy Registration
                            </h3>
                            <p className="text-gray-600">
                                Students can quickly browse and register for approved academic events.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Faculty Approval System
                            </h3>
                            <p className="text-gray-600">
                                Structured workflow for reviewing, approving, and managing event proposals.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Centralized Dashboard
                            </h3>
                            <p className="text-gray-600">
                                Role-based dashboards for admins, faculty, and students.
                            </p>
                        </div>

                    </div>
                </div>
            </section>


            {/* ================= CTA SECTION ================= */}
            <section className="bg-blue-600 py-16">
                <div className="max-w-4xl mx-auto text-center px-6">
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your University Events?
                    </h2>

                    <a 
                        href="/signup"
                        className="inline-block px-10 py-3 bg-white text-blue-600 font-semibold rounded-xl shadow-md hover:bg-gray-100 transition-all duration-300"
                    >
                        Get Started Today
                    </a>

                </div>
            </section>

        </div>
    );
};

export default Home;