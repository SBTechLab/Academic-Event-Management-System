const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-5xl font-bold text-primary mb-6">
                Academic Event Management System
            </h1>
            <p className="text-xl text-text/80 max-w-2xl mb-10">
                Streamline event coordination, registration, and communication for university departments.
            </p>
            <div className="flex gap-4">
                <a href="/events" className="bg-primary text-white px-8 py-3 rounded-lg text-lg hover:bg-opacity-90 transition-colors">
                    Browse Events
                </a>
                <a href="/about" className="bg-surface text-primary border border-primary px-8 py-3 rounded-lg text-lg hover:bg-primary/10 transition-colors">
                    Learn More
                </a>
            </div>
        </div>
    );
};

export default Home;
