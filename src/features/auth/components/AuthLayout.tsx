import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden" style={{
        backgroundImage: 'url("/auth_background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Dark Overlay for Contrast */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Decorative Elements */}
        <div className="absolute inset-0 pattern-mandala opacity-50" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-8 lg:p-12 xl:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl w-full space-y-6 lg:space-y-8"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-4 lg:mb-6">
              <img 
                src="/pahadi_match_full.png" 
                alt="PahadiMatch" 
                className="w-32 h-16 lg:w-40 lg:h-20 xl:w-48 xl:h-24 object-contain"
              />
            </div>
            
            {/* Brand Name */}
            <div className="space-y-2 lg:space-y-3">
              <div className="backdrop-blur-sm bg-white/20 rounded-lg px-4 py-2">
                <p className="font-display text-base lg:text-lg xl:text-xl text-white text-center">
                  Where Mountains Meet Hearts
                </p>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 pt-4 lg:pt-6">
              {[
                { title: 'Trusted', desc: 'Authentic community' },
                { title: '98%', desc: 'Happiness Rate' },
                { title: '100%', desc: 'Privacy Assured' },
                { title: '24/7', desc: 'Support Available' },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-5 border border-white/50"
                >
                  <span className="block text-2xl lg:text-3xl font-bold text-primary mb-1">{item.title}</span>
                  <span className="text-xs lg:text-sm text-text-secondary">{item.desc}</span>
                </motion.div>
              ))}
            </div>
            
            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-4 pt-4 lg:pt-6">
              <div className="w-16 lg:w-20 h-0.5 bg-gradient-to-r from-transparent to-primary-200" />
              <div className="w-5 h-5 lg:w-6 lg:h-6 text-primary">❤️</div>
              <div className="w-16 lg:w-20 h-0.5 bg-gradient-to-l from-transparent to-primary-200" />
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Wave */}
        <svg 
          className="absolute bottom-0 left-0 right-0" 
          viewBox="0 0 1440 120" 
          fill="none"
        >
          <path 
            d="M0 120V60C240 20 480 0 720 20C960 40 1200 80 1440 60V120H0Z" 
            fill="rgba(184, 51, 106, 0.05)"
          />
        </svg>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-20 py-6 sm:py-8 md:py-10 lg:py-12 bg-surface">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <img 
              src="/pahadi_match_logo_mobile.png" 
              alt="PahadiMatch" 
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
            />
            <span className="font-script text-2xl sm:text-3xl text-primary">PahadiMatch</span>
          </div>

          {/* Title */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-text mb-2 sm:mb-3 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-text-secondary leading-relaxed mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="w-full">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

