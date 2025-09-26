import { useRef, useEffect, useState } from 'react';

const ScrollHeatMap = () => {
    const canvasRef = useRef(null);
    const contentRef = useRef(null);
    const containerRef = useRef(null);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [showHeatMap, setShowHeatMap] = useState(true);
    const [opacity, setOpacity] = useState(0.6);
    const [selectedColorScheme] = useState('standard');

    // Sample data - replace with your actual data
    const heatMapData = {
        "status": 200,
        "total_time": {
            "1": 108, "2": 109, "3": 110, "4": 111, "5": 112, "6": 113, "7": 115, "8": 118, "9": 118, "10": 119,
            "11": 119, "12": 120, "13": 121, "14": 124, "15": 126, "16": 128, "17": 129, "18": 134, "19": 136, "20": 136,
            "21": 137, "22": 138, "23": 140, "24": 142, "25": 143, "26": 144, "27": 156, "28": 157, "29": 158, "30": 163,
            "31": 164, "32": 168, "33": 171, "34": 177, "35": 174, "36": 175, "37": 175, "38": 187, "39": 195, "40": 198,
            "41": 198, "42": 212, "43": 214, "44": 218, "45": 220, "46": 225, "47": 223, "48": 224, "49": 225, "50": 225,
            "51": 230, "52": 224, "53": 222, "54": 220, "55": 221, "56": 223, "57": 221, "58": 221, "59": 221, "60": 219,
            "61": 219, "62": 219, "63": 219, "64": 216, "65": 214, "66": 219, "67": 222, "68": 220, "69": 220, "70": 216,
            "71": 216, "72": 215, "73": 213, "74": 211, "75": 198, "76": 196, "77": 195, "78": 186, "79": 173, "80": 167,
            "81": 167, "82": 163, "83": 158, "84": 157, "85": 156, "86": 155, "87": 152, "88": 150, "89": 131, "90": 131,
            "91": 132, "92": 131, "93": 125, "94": 126, "95": 123, "96": 122, "97": 123, "98": 122, "99": 39, "100": 37
        },
        "total_user": {
            "1": 44, "2": 44, "3": 44, "4": 44, "5": 44, "6": 44, "7": 44, "8": 44, "9": 44, "10": 44,
            "11": 44, "12": 44, "13": 44, "14": 44, "15": 44, "16": 44, "17": 44, "18": 44, "19": 44, "20": 44,
            "21": 44, "22": 44, "23": 44, "24": 44, "25": 44, "26": 44, "27": 44, "28": 44, "29": 44, "30": 44,
            "31": 44, "32": 44, "33": 44, "34": 44, "35": 44, "36": 44, "37": 43, "38": 42, "39": 41, "40": 41,
            "41": 41, "42": 41, "43": 41, "44": 41, "45": 41, "46": 41, "47": 41, "48": 41, "49": 41, "50": 35,
            "51": 35, "52": 35, "53": 35, "54": 35, "55": 35, "56": 35, "57": 34, "58": 34, "59": 34, "60": 33,
            "61": 33, "62": 33, "63": 33, "64": 32, "65": 32, "66": 32, "67": 32, "68": 32, "69": 32, "70": 32,
            "71": 32, "72": 32, "73": 31, "74": 30, "75": 30, "76": 30, "77": 30, "78": 30, "79": 30, "80": 30,
            "81": 30, "82": 29, "83": 29, "84": 29, "85": 29, "86": 28, "87": 28, "88": 28, "89": 27, "90": 27,
            "91": 27, "92": 27, "93": 26, "94": 25, "95": 24, "96": 24, "97": 24, "98": 24, "99": 23, "100": 23
        }
    };

    // Color schemes - simplified to standard heat colors
    const colorSchemes = {
        standard: {
            name: '標準',
            colors: ['rgba(0,0,255,', 'rgba(0,150,255,', 'rgba(0,255,0,', 'rgba(255,255,0,', 'rgba(255,0,0,']
        }
    };

    const getHeatColor = (intensity, scheme) => {
        const colors = colorSchemes[scheme].colors;
        const colorIndex = Math.floor(intensity * (colors.length - 1));
        const actualIndex = Math.min(colorIndex, colors.length - 1);
        return colors[actualIndex];
    };

    const drawHeatMap = () => {
        const canvas = canvasRef.current;
        const content = contentRef.current;

        if (!canvas || !content || !contentLoaded) return;

        const ctx = canvas.getContext('2d');
        const contentRect = content.getBoundingClientRect();

        // Set canvas size to match content
        canvas.width = contentRect.width;
        canvas.height = contentRect.height;
        canvas.style.width = `${contentRect.width}px`;
        canvas.style.height = `${contentRect.height}px`;

        // Clear canvas
        ctx.clearRect(0, 0, contentRect.width, contentRect.height);

        if (!showHeatMap) return;

        // Only use total_time data for clean gradient
        const timeValues = Object.values(heatMapData.total_time);
        const maxTime = Math.max(...timeValues);
        const minTime = Math.min(...timeValues);

        // Create a single smooth vertical gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, contentRect.height);

        timeValues.forEach((time, index) => {
            const position = index / (timeValues.length - 1);
            const intensity = (time - minTime) / (maxTime - minTime); // Normalize to 0-1

            let color;
            if (intensity < 0.25) {
                // Blue to Cyan
                const t = intensity * 4;
                color = `rgba(${Math.round(0 * (1 - t) + 0 * t)}, ${Math.round(0 * (1 - t) + 255 * t)}, ${Math.round(255 * (1 - t) + 255 * t)}, ${intensity * opacity})`;
            } else if (intensity < 0.5) {
                // Cyan to Green
                const t = (intensity - 0.25) * 4;
                color = `rgba(0, ${Math.round(255)}, ${Math.round(255 * (1 - t) + 0 * t)}, ${intensity * opacity})`;
            } else if (intensity < 0.75) {
                // Green to Yellow
                const t = (intensity - 0.5) * 4;
                color = `rgba(${Math.round(0 * (1 - t) + 255 * t)}, 255, 0, ${intensity * opacity})`;
            } else {
                // Yellow to Red
                const t = (intensity - 0.75) * 4;
                color = `rgba(255, ${Math.round(255 * (1 - t) + 0 * t)}, 0, ${intensity * opacity})`;
            }

            gradient.addColorStop(position, color);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, contentRect.width, contentRect.height);
    };

    useEffect(() => {
        // Trigger content loaded after component mounts
        const timer = setTimeout(() => {
            setContentLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (contentLoaded) {
            drawHeatMap();
        }
    }, [contentLoaded, showHeatMap, opacity, selectedColorScheme]);

    useEffect(() => {
        const handleResize = () => {
            if (contentLoaded) {
                drawHeatMap();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [contentLoaded, showHeatMap, opacity, selectedColorScheme]);

    return (
        <div className="w-full min-h-screen bg-gray-100">
            {/* Control Panel */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center gap-6">
                        <h1 className="text-xl font-bold text-gray-800">Heatmap Analysis</h1>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showHeatMap}
                                onChange={(e) => setShowHeatMap(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm font-medium">ヒートマップを表示</span>
                        </label>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">透明度:</label>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={opacity}
                                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                                className="w-24"
                            />
                            <span className="text-sm text-gray-600">{Math.round(opacity * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area with Heatmap Overlay */}
            <div className="relative" ref={containerRef}>
                {/* Percentage Axis */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-white bg-opacity-90 border-r border-gray-300 z-20">
                    {[0, 25, 50, 75, 100].map((percent) => (
                        <div
                            key={percent}
                            className="absolute right-2 text-xs text-gray-600 font-medium transform -translate-y-1/2"
                            style={{ top: `${percent}%` }}
                        >
                            {percent}%
                        </div>
                    ))}
                </div>

                {/* Your HTML Content */}
                <div
                    ref={contentRef}
                    className="relative bg-white ml-16"
                    style={{ minHeight: '100vh' }}
                >
                    {/* This is your actual HTML content */}
                    <div className="heatmap_view -v3 pc js-iframe_contents" style={{ visibility: 'visible', opacity: 1 }}>
                        <div className="entry wide js-height">
                            <div className="content">
                                <img
                                    src="https://stg-prtimes.net/common/v4.1/images/company/prev_dummy_header.png"
                                    className="preview-header w-full h-16 bg-gray-200 object-cover"
                                    alt="Header"
                                />
                                <article className="container-content box bg-white">
                                    <div className="inner p-8">
                                        <header className="header-release-detail mb-8">
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                                Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps
                                            </h2>
                                            <h3 className="text-xl text-gray-600 mb-4"></h3>
                                            <div className="release--info_wrapper flex items-center gap-4 mb-6">
                                                <div className="information-release">
                                                    <div className="company-name">
                                                        <a href="#" className="text-blue-600 hover:underline">株式会社STG Chanoknan</a>
                                                    </div>
                                                    <time className="time text-gray-500 text-sm">2025年9月8日 17時28分</time>
                                                </div>
                                                <div className="flex gap-2">
                                                    {/* Social media icons */}
                                                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                                                    <div className="w-8 h-8 bg-blue-600 rounded"></div>
                                                    <div className="w-8 h-8 bg-green-500 rounded"></div>
                                                </div>
                                            </div>
                                        </header>

                                        <div className="r-head mb-6"></div>

                                        <div className="r-text clearfix">
                                            <div className="rich-text prose max-w-none">
                                                <p className="text-gray-700 leading-relaxed mb-6 break-words">
                                                    Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps
                                                </p>

                                                <div className="pr-img mb-8">
                                                    <figure className="pr-img__item--large">
                                                        <img
                                                            src="https://prcdn-dev.freetls.fastly.net/release_image/97919/1/97919-1-ff718fea5bf50824c2e4f8b863faef0d-1080x1080.jpg?width=1950&height=1350&quality=85%2C65&format=jpeg&auto=webp&fit=bounds&bg-color=fff"
                                                            className="w-full h-auto rounded-lg shadow-lg"
                                                            alt="Content Image 1"
                                                        />
                                                        <figcaption className="pr-img__item__caption text-center text-gray-500 text-sm mt-2"></figcaption>
                                                    </figure>
                                                </div>

                                                <div className="pr-img mb-8">
                                                    <figure className="pr-img__item--large">
                                                        <img
                                                            src="https://prcdn-dev.freetls.fastly.net/release_image/97919/1/97919-1-30dd829bede0b259dc178fb1e6915fab-866x866.png?width=1950&height=1350&quality=85%2C75&format=jpeg&auto=webp&fit=bounds&bg-color=fff"
                                                            className="w-full h-auto rounded-lg shadow-lg"
                                                            alt="Content Image 2"
                                                        />
                                                        <figcaption className="pr-img__item__caption text-center text-gray-500 text-sm mt-2"></figcaption>
                                                    </figure>
                                                </div>

                                                <p className="text-gray-700 leading-relaxed break-words">
                                                    Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps Heatmaps
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 pointer-events-none z-10"
                    style={{
                        left: '64px' // Offset by axis width
                    }}
                />

                {/* Intensity Scale */}
                {showHeatMap && (
                    <div className="fixed top-20 right-4 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg z-30 border">
                        <div className="text-xs font-medium text-gray-700 mb-2">エンゲージメント</div>
                        <div className="flex flex-col gap-1">
                            {['Very High', 'High', 'Medium', 'Low'].map((level, index) => (
                                <div key={level} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded"
                                        style={{
                                            backgroundColor: getHeatColor((3 - index) / 3, selectedColorScheme) + '0.8)'
                                        }}
                                    ></div>
                                    <span className="text-xs text-gray-600">{level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScrollHeatMap;
