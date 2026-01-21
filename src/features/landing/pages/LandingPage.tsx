import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Heart,
  MapPin,
  Shield,
  Users,
  Sparkles,
  Headphones,
  UserPlus,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Navigation,
  Check,
  Star,
  Globe,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-script text-primary">Pahadimatch</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-text hover:text-primary transition-colors">How It Works</a>
              <a href="#success-stories" className="text-text hover:text-primary transition-colors">Success Stories</a>
              <a href="#about" className="text-text hover:text-primary transition-colors">About</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-text hover:text-primary transition-colors">
                <span className="text-sm">हिं</span>
              </button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="hidden sm:flex"
              >
                Login
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/signup')}
                className="hidden sm:flex"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden min-h-[600px] flex items-center">
        {/* Ganesha Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/temple.png)'
          }}
        ></div>
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-primary-50/60 to-cream/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
        <div className="absolute inset-0 pattern-mandala opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-8"
            >
              <span className="bg-white/90 backdrop-blur-sm text-primary px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg border border-primary/20">
                Trusted by 1000+ Pahadis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight"
            >
              <span className="block text-text mb-2 drop-shadow-sm">
                Find Your Soulmate from the
              </span>
              <span className="block text-primary font-script text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none drop-shadow-md">
                Heart of Uttarakhand
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary mb-10 leading-relaxed font-medium drop-shadow-sm"
            >
              Connect with like-minded Kumaoni & Garhwali singles who share your values, traditions, and dreams. Experience matchmaking that understands our pahadi culture.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto bg-white"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1K+</div>
              <div className="text-sm text-text-secondary">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-sm text-text-secondary">Happy Couples</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-text-secondary">Verified Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">Live Now</div>
              <div className="text-sm text-text-secondary">1,247 People online from Uttarakhand</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Pahadimatch */}
      <section id="why-choose" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-4xl md:text-5xl font-script text-primary">Why Choose Pahadimatch</h2>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-text mb-4">Built for Our Pahadi Community</h3>
            <p className="max-w-3xl mx-auto text-text-secondary">
              We understand the unique needs of Uttarakhand's diverse communities. Our platform celebrates our rich heritage while embracing modern connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Region-Specific Matching',
                description: 'Connect with people from Kumaon, Garhwal, and across all 13 districts of Uttarakhand.',
                gradient: 'from-pink-200 to-pink-100',
              },
              {
                icon: Heart,
                title: 'Cultural Understanding',
                description: 'We understand Pahadi traditions, customs, and the importance of family values.',
                gradient: 'from-pink-200 to-pink-100',
              },
              {
                icon: Shield,
                title: 'Verified Profiles',
                description: 'Every profile is manually verified to ensure genuine connections and safe experience.',
                gradient: 'from-yellow-200 to-yellow-100',
              },
              {
                icon: Users,
                title: 'Family Involvement',
                description: 'Option for family members to participate in the matchmaking process.',
                gradient: 'from-pink-200 to-pink-100',
              },
              {
                icon: Sparkles,
                title: 'Compatibility Matching',
                description: 'Advanced algorithms considering caste preferences, values, and lifestyle choices.',
                gradient: 'from-yellow-200 to-yellow-100',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                description: 'Dedicated support team to assist you in your journey to find the perfect match.',
                gradient: 'from-pink-200 to-pink-100',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold text-text mb-2">{feature.title}</h4>
                    <p className="text-text-secondary">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-5 h-5 text-accent" />
              <h2 className="text-3xl font-script text-primary">Simple Process</h2>
              <Star className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">How Pahadimatch Works</h3>
            <p className="max-w-2xl mx-auto text-text-secondary">
              Finding your perfect pahadi partner is just four simple steps away. Join thousands who have already found their soulmate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: '01',
                icon: UserPlus,
                title: 'Create Your Profile',
                description: 'Sign up free and create your detailed profile with photos, preferences, and family background.',
                gradient: 'from-pink-500 to-red-500',
              },
              {
                number: '02',
                icon: Search,
                title: 'Discover Matches',
                description: 'Browse verified profiles or let our smart algorithm suggest compatible matches from your region.',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                number: '03',
                icon: MessageCircle,
                title: 'Connect & Chat',
                description: 'Express interest, send messages, and get to know potential partners in a safe environment.',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                number: '04',
                icon: Heart,
                title: 'Find Your Match',
                description: 'Meet in person with family involvement and begin your beautiful journey together.',
                gradient: 'from-pink-500 to-red-500',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 border-t-2 border-dashed border-primary/30 z-0" style={{ width: 'calc(100% - 4rem)' }}></div>
                )}
                <Card className="relative z-10 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-gray-200 mb-2">{step.number}</div>
                    <h4 className="text-xl font-semibold text-text mb-3">{step.title}</h4>
                    <p className="text-text-secondary text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-4xl md:text-5xl font-script text-primary">Success Stories</h2>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-text mb-4">Couples United by Pahadimatch</h3>
            <p className="max-w-2xl mx-auto text-text-secondary">
              Real stories from real couples who found their perfect match on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'We met on Pahadimatch and instantly connected over our shared love for pahadi culture. The platform made it so easy to find someone from our own region who understands our values.',
                couple: 'Deepak & Kavita Bisht',
                year: 'Married 2023',
                location: 'Almora, Kumaon',
                bgColor: 'bg-pink-100',
              },
              {
                quote: 'Finding a life partner who shares the same pahadi roots was important to us. Pahadimatch helped us find each other, and our families instantly connected too!',
                couple: 'Rajesh & Sunita Rawat',
                year: 'Married 2024',
                location: 'Dehradun, Garhwal',
                bgColor: 'bg-yellow-100',
              },
              {
                quote: 'As NRIs, we wanted to connect with someone from our homeland. Pahadimatch made our long-distance love story possible. Now we\'re happily married!',
                couple: 'Vinod & Priya Joshi',
                year: 'Married 2024',
                location: 'Nainital, Kumaon',
                bgColor: 'bg-orange-100',
              },
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`h-full ${story.bgColor} border-0 hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="text-6xl font-serif text-accent mb-4 leading-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>
                    <p className="text-text mb-6 italic">{story.quote}</p>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-semibold text-text">{story.couple}</span>
                      </div>
                      <div className="text-accent font-medium mb-1">{story.year}</div>
                      <div className="text-text-secondary text-sm">{story.location}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 overflow-hidden">
      <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/ganesha.jpg)'
          }}
        ></div>
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-primary-50/60 to-cream/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent"></div>
        <div className="absolute inset-0 pattern-mandala opacity-20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-script text-primary mb-6"
            >
              Your Pahadi Soulmate is Waiting
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-text-secondary mb-8"
            >
              Join the largest community of Uttarakhandi singles. Download the app and your perfect match could be just a click away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto bg-white"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6"
            >
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-bold text-primary">Free</span>
                <span className="text-text-secondary text-sm">Download</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="font-bold text-primary">100%</span>
                <span className="text-text-secondary text-sm">Privacy</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Check className="w-5 h-5 text-success" />
                <span className="text-text-secondary text-sm">Verified Profiles</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-script">Pahadimatch</span>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Connecting hearts across the Himalayas. The trusted matrimony platform for Uttarakhand's Kumaoni and Garhwali communities.
              </p>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@pahadimatch.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 954 801 2119</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>Dehradun, Uttarakhand, India</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
              <div className="mt-4 text-sm text-white/60">
                Powered by{' '}
                <a 
                  href="https://zerontech.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline"
                >
                  Zeron Technologies
                  <Globe className="w-3 h-3 inline ml-1" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
            © 2026 Pahadimatch. All rights reserved. Made in Uttarakhand.
          </div>
        </div>
      </footer>
    </div>
  );
}

