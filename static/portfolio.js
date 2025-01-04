const { useState, useEffect, useMemo } = React;

// Utility function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Loading Screen Component
const LoadingScreen = ({ onComplete, currentValue }) => {
    useEffect(() => {
        let progress = 0;
        const interval = setInterval(() => {
            // Only progress if we have a valid value
            if (currentValue > 1) {
                progress += 2;
                const count = document.querySelector('.loading-count');
                if (count) count.textContent = Math.min(progress, 100);
                
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 300);
                }
            }
        }, 10);

        return () => clearInterval(interval);
    }, [onComplete, currentValue]);

    return (
        <div className="loading-overlay">
            <div className="text-center">
                <div className="loading-text mb-4">Loading Portfolio</div>
                <div className="loading-count text-6xl font-bold">0</div>
                <div className="mt-2 text-gray-400">%</div>
            </div>
        </div>
    );
};

// Particles Background Component
const Particles = ({ count = 30 }) => {
    const particles = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            tx: (Math.random() - 0.5) * 200,
            ty: (Math.random() - 0.5) * 200,
            delay: Math.random() * 2
        }));
    }, [count]);

    return (
        <div className="particles">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="particle"
                    style={{
                        '--tx': `${particle.tx}px`,
                        '--ty': `${particle.ty}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${particle.delay}s`
                    }}
                />
            ))}
        </div>
    );
};

// Main Portfolio Display Component
const PortfolioDisplay = () => {
    const [value, setValue] = useState(0);
    const [previousValue, setPreviousValue] = useState(0);
    const [isMillionaire, setIsMillionaire] = useState(false);
    const [valueChange, setValueChange] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const GOAL = 1000000;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/portfolio-value');
                const data = await response.json();
                
                setPreviousValue(value);
                setValue(data.value);
                setIsMillionaire(data.value >= GOAL);
                setValueChange(data.value > value ? 'up' : data.value < value ? 'down' : null);
                
                setTimeout(() => setValueChange(null), 500);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        // Initial fetch
        fetchData();

        // Set up polling if not in loading state
        if (!isLoading) {
            const interval = setInterval(fetchData, 5000);
            return () => clearInterval(interval);
        }
    }, [value, isLoading]);

    const progressPercent = Math.min((value / GOAL) * 100, 100);
    const walletAddresses = [
        "2AiLzs7bhm2kJkx4hw62kNykTcqHuWhFWwbumLMaHJPv",
        "GvhEuFmQYnxtXnyT1dwkLabgWhMGbgimJXvGdHSuMdNU"
    ];

    return (
        <>
            {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} currentValue={value} />}
            <div className={`min-h-screen py-20 px-4 transition-all duration-1000 ${
                isMillionaire ? 'bg-gradient-to-br from-green-900 via-green-800 to-black' : 
                'bg-gradient-to-br from-red-900 via-red-800 to-black'
            }`}>
                <Particles count={30} />
                
                <div className="max-w-4xl mx-auto relative">
                    <h1 className={`text-8xl font-bold text-center mb-12 ${
                        isMillionaire ? 'millionaire-gradient-text' : 'gradient-text'
                    }`}>
                        Is Moe a Millionaire?
                    </h1>
                    
                    <div className="card p-10 mb-12">
                        <div className={`text-9xl font-bold text-center mb-8 number-animation ${
                            valueChange === 'up' ? 'up' : valueChange === 'down' ? 'down' : ''
                        }`}>
                            {formatCurrency(value)}
                        </div>
                        
                        <div className="progress-container mb-6">
                            <div 
                                className={`progress-bar ${isMillionaire ? 'millionaire-progress-bar' : ''}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        
                        <div className="text-3xl text-center font-semibold">
                            {isMillionaire ? (
                                <span className="millionaire-gradient-text">
                                    🎉 MOE IS A MILLIONAIRE! 🎉
                                </span>
                            ) : (
                                <span className="gradient-text">
                                    {formatCurrency(GOAL - value)} to go!
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {walletAddresses.map((address, index) => (
                            <div key={address} className="card p-8">
                                <h2 className="text-2xl font-bold mb-4">Wallet {index + 1}</h2>
                                <p className="text-gray-400 break-all text-sm">{address}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PortfolioDisplay;
