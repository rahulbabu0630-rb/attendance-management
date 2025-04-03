import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AboutUs from "../components/AboutUs";
import Gallery from "../components/Gallery";

const products = [
  { name: "Gifting", image: "/assets/products/gifting.jpg", gradient: "from-purple-600/80 to-pink-600/80" },
  { name: "Cakes", image: "/assets/products/cakes.jpg", gradient: "from-amber-600/80 to-orange-600/80" },
  { name: "Dry Fruits", image: "/assets/products/dryfruits.jpg", gradient: "from-yellow-600/80 to-amber-600/80" },
  { name: "Ghee Sweets", image: "/assets/products/ghee.jpg", gradient: "from-red-600/80 to-pink-600/80" },
  { name: "Namkeen", image: "/assets/products/namkeen.jpg", gradient: "from-green-600/80 to-emerald-600/80" },
  { name: "Ice Cream", image: "/assets/products/icecream.jpg", gradient: "from-blue-400/80 to-indigo-600/80" },
];

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const categories = [
    {id: 1, text: ''}, {id: 2, text: ''}, {id: 3, text: ''}, {id: 4, text: ''}, {id: 5, text: ''},
    {id: 6, text: ''}, {id: 7, text: ''}, {id: 8, text: ''}, {id: 9, text: ''}, {id: 10, text: ''},
    {id: 11, text: 'HOME FOODS'}, 
    {id: 12, text: '|', isSeparator: true}, 
    {id: 13, text: 'CAKES & PASTRIES'},
    {id: 14, text: '|', isSeparator: true}, 
    {id: 15, text: 'GHEE FOODS'}, 
    {id: 16, text: '|', isSeparator: true},
    {id: 17, text: 'DRY FRUITS'}, 
    {id: 18, text: '|', isSeparator: true},
    {id: 19, text: 'ICE CREAM'},
    {id: 20, text: ''}, {id: 21, text: ''}, {id: 22, text: ''}, {id: 23, text: ''}, {id: 24, text: ''},
    {id: 25, text: ''}, {id: 26, text: ''}, {id: 27, text: ''}, {id: 28, text: ''},
    {id: 29, text: '~PROPRIETOR : CH . RAMU'}
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (page) => {
    const routeMap = {
      'Home': '#home',
      'About Us': '#about',
      'Gallery': '#gallery',
      'Attendance': '/attendance',
      'Contact Us': '/contact-us'
    };
    
    if (routeMap[page]) {
      if (page === 'Attendance' || page === 'Contact Us') {
        navigate(routeMap[page]);
      } else {
        const element = document.querySelector(routeMap[page]);
        if (element) {
          if (page === 'Gallery') {
            // Scroll to bottom of gallery section
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: 'smooth'
            });
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  };

  const getActivePage = () => {
    const hash = location.hash;
    if (hash === '#home' || hash === '' || hash === '#') return 'Home';
    if (hash === '#about') return 'About Us';
    if (hash === '#gallery') return 'Gallery';
    if (location.pathname === '/attendance') return 'Attendance';
    if (location.pathname === '/contact-us') return 'Contact Us';
    return '';
  };

  const activePage = getActivePage();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center z-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-600 opacity-20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent rounded-full animate-spin"
              style={{
                borderTopColor: 'transparent',
                borderRightColor: '#EC4899',
                borderBottomColor: 'transparent',
                borderLeftColor: '#DC2626',
              }}>
            </div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-center text-transparent bg-clip-text flex items-center bg-gradient-to-r from-pink-600 to-red-600 font-medium">
            Loading 
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Navbar */}
      <div className="w-screen bg-pink-700 relative left-1/2 right-1/2 mx-[-50vw]">
        <nav className="max-w-screen-4xl mx-auto px-4 sm:px-6 lg:px-8 relative h-15">
          <div className="absolute left-4 sm:left-6 lg:left-8 h-full flex items-center">
            <a href="#home" className="transition-transform hover:scale-105 block h-full flex items-center">
              <img 
                className="h-[100%] max-h-[70px] object-contain" 
                src="/assets/logo.png" 
                alt="Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e91e63'/%3E%3Ctext x='50%' y='50%' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'%3ELogo%3C/text%3E%3C/svg%3E";
                }}
              />
            </a>
          </div>
          
          <div className="h-full flex justify-end items-center">
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {['Home', 'About Us', 'Gallery', 'Attendance', 'Contact Us'].map((item) => (
                <button
                  key={item} 
                  onClick={() => handleNavigation(item)}
                  className={`relative text-white transition-all duration-300 font-semibold px-3 py-2 text-lg
                    ${activePage === item ? 
                      'text-pink-100 scale-105' : 
                      'hover:text-pink-100 hover:scale-105'}
                  `}
                >
                  {item}
                  {activePage === item && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-pink-100 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Title with categories below */}
      <div className="relative pt-16 pb-8 px-8 text-center" id="home">
        <div className="flex flex-col items-center">
          <div 
            className="text-pink-600 text-4xl md:text-5xl font-bold mb-1 relative"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-1px',
              lineHeight: '1.1',
              display: 'inline-block'
            }}
          >
            SRI DURGA DEVI SWEETS & BAKERY
            <div 
              className="text-2xl md:text-3xl text-pink-700 font-medium absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap"
              style={{
                bottom: '-2.5rem',
                fontFamily: "'Noto Sans Telugu', sans-serif"
              }}
            >
              స్వచ్చంధానికి చెరగని చిరునామా
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col items-center mt-12">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {categories.map((category) => (
              <span 
                key={category.id} 
                className={`text-pink-600 hover:text-pink-800 text-lg font-medium uppercase tracking-wide transition-colors duration-300
                  ${category.isSeparator ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {category.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="w-full px-4 sm:px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-0">
          <h2 className="text-5xl font-semibold text-center text-red-700/90 mb-12">Our Top Picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product) => (
              <div 
                key={product.name} 
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full"
              >
                <div className="aspect-w-4 aspect-h-3 w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' font-size='12' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EImage%20Not%20Found%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${product.gradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8`}>
                  <h3 className="text-white text-4xl font-bold translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                    {product.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full min-h-screen">
        <AboutUs />
      </section>

      {/* Gallery Section - Full view */}
      <section id="gallery" className="w-full min-h-screen bg-gradient-to-b from-[#5d375a] to-[#1b020f] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <Gallery />
        </div>
      </section>
    </div>
  );
};

export default Home;