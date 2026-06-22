import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Search, Network, Brain, GitBranch, Link as ChainIcon, Settings, Menu, X, Shield, BrainCircuit } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Address Tracer', path: '/trace', icon: Search },
  { label: 'Graph Explorer', path: '/explorer', icon: Network },
  { label: 'ML Predictions', path: '/predictions', icon: Brain },
  { label: 'Clusters', path: '/clusters', icon: GitBranch },
  { label: 'Multi-Agent', path: '/multi-agent', icon: ChainIcon },
  { label: 'Advanced AI', path: '/advanced-ai', icon: BrainCircuit },
]

export default function Navbar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Only apply transparency on home page, or based on scroll
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClasses = `fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 transition-all duration-500 ease-in-out px-6 py-3 rounded-[32px] border flex items-center justify-between
    ${isHomePage && !scrolled 
      ? 'bg-white/5 border-white/10 backdrop-blur-xl' 
      : 'bg-black/80 border-white/20 backdrop-blur-2xl shadow-2xl shadow-black/50'
    }`

  return (
    <nav className={navClasses}>
      {/* Brand - Oval Shape */}
      <Link to="/" className="flex items-center space-x-3 group">
        <motion.div 
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8 }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
        >
          <Shield size={22} className="text-black" />
        </motion.div>
        <span className="text-xl font-bold tracking-tighter text-white">
          CryptoTrace
        </span>
      </Link>

      {/* Desktop Nav - Glassy Buttons */}
      <div className="hidden md:flex items-center space-x-2">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2
                ${isActive 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <link.icon size={16} />
              <span>{link.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Right Side Buttons */}
      <div className="flex items-center space-x-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:block px-6 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all backdrop-blur-md"
        >
          Connect
        </motion.button>
        
        <button
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-full"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-4 mx-2 p-6 bg-black/90 border border-white/20 backdrop-blur-2xl rounded-3xl overflow-hidden md:hidden"
          >
            <div className="space-y-3">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg font-medium transition-all ${
                      isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <link.icon size={22} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              <button className="w-full mt-4 py-4 bg-white text-black rounded-2xl font-bold text-lg">
                Connect Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
