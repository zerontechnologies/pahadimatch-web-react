import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Mail, Phone, Navigation, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-script text-primary">
                Pahadimatch
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Privacy Content */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardContent className="p-8 space-y-6">

                <div>
                  <h1 className="text-3xl font-display font-semibold text-text mb-2">
                    Privacy Policy
                  </h1>
                  <p className="text-text-secondary text-sm">
                    Last Updated: 12-02-2026
                  </p>
                </div>

                <div className="space-y-6 text-sm text-text-muted leading-relaxed">

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      1. Introduction
                    </h2>
                    <p>
                      PahadiMatch (“Platform”) is owned and operated by 
                      Zerontechnologies (“Company”, “We”, “Us”, “Our”). 
                      We respect your privacy and are committed to protecting 
                      your personal data.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      2. Information We Collect
                    </h2>
                    <p>
                      We collect personal information such as name, age,
                      contact details, religion, caste, education,
                      profile photos, and technical information like IP address,
                      browser type, cookies, and usage data.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      3. How We Use Information
                    </h2>
                    <p>
                      Information is used for matchmaking services,
                      communication between users, platform improvements,
                      fraud prevention, and legal compliance.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      4. Data Sharing
                    </h2>
                    <p>
                      We do not sell or rent user data. Profile visibility
                      depends on user privacy settings. Data may be shared
                      if legally required.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      5. Data Security
                    </h2>
                    <p>
                      We implement reasonable security measures to protect
                      personal data. However, no system can guarantee absolute security.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      6. Contact Us
                    </h2>
                    <p>
                      For privacy-related concerns, contact Zerontechnologies
                      via official support channels.
                    </p>
                  </section>

                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* Footer (Same as LandingPage style) */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-script">
                  Pahadimatch
                </span>
              </div>
              <p className="text-white/80 text-sm">
                Connecting hearts across Uttarakhand.
              </p>
            </div>

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
                <span>Dehradun, Uttarakhand</span>
              </div>
            </div>

            <div className="text-sm text-white/60">
              Powered by{" "}
              <a
                href="https://zerontech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Zeron Technologies <Globe className="w-3 h-3 inline ml-1" />
              </a>
            </div>

          </div>

          <div className="border-t border-white/20 pt-6 text-center text-sm text-white/60">
            © 2026 Pahadimatch. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
