import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Mail, Phone, Navigation, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/pahadi_match_full.png" 
                alt="PahadiMatch" 
                className="w-20 h-10 hidden lg:block object-contain"
              />
              <img 
                src="/pahadi_match_logo_mobile.png" 
                alt="PahadiMatch" 
                className="w-16 h-8 lg:hidden object-contain"
              />
            </Link>
          </div>
        </div>
      </nav>

      {/* Terms Content */}
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
                    Terms &amp; Conditions
                  </h1>
                  <p className="text-text-secondary text-sm">
                    Last updated: 12-02-2026
                  </p>
                  <p className="mt-4 text-sm text-text-muted leading-relaxed">
                    Welcome to PahadiMatch, an online matrimonial platform
                    owned and operated by Zerontechnologies (&quot;Company&quot;,
                    &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;). By accessing, registering, or using
                    PahadiMatch.com and its related services (collectively
                    referred to as the &quot;Platform&quot;), you agree to be bound by
                    these Terms &amp; Conditions (&quot;Terms&quot;). If you do not agree
                    with these Terms, please discontinue use of the Platform.
                  </p>
                </div>

                <div className="space-y-6 text-sm text-text-muted leading-relaxed">
                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      1. Introduction
                    </h2>
                    <p>
                      These Terms and Conditions (&quot;Terms&quot;) govern your access
                      to and use of Pahadimatch, a matrimonial service operated
                      and managed under Zerontechnologies Company, a legally
                      registered company. By registering or using Pahadimatch,
                      you agree to be bound by these Terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      2. Company Ownership
                    </h2>
                    <p>
                      Pahadimatch is a product/brand operated under
                      Zerontechnologies Company, which is an already registered
                      legal entity. All legal, financial, and operational
                      responsibilities related to Pahadimatch are undertaken by
                      Zerontechnologies Company.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      3. Eligibility
                    </h2>
                    <p className="mb-2">
                      By using the Platform, you confirm that:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>You are 18 years or older (female) or 21 years or older (male).</li>
                      <li>You are legally competent to marry under applicable Indian laws.</li>
                      <li>You are not prohibited from entering into a valid marriage.</li>
                      <li>You are using the Platform for genuine matrimonial purposes only.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      4. User Registration &amp; Account Responsibility
                    </h2>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        Users are responsible for maintaining the confidentiality
                        of their login credentials.
                      </li>
                      <li>
                        All information provided must be true, accurate, and up
                        to date.
                      </li>
                      <li>
                        Zerontechnologies reserves the right to suspend or
                        terminate accounts providing false, misleading, or
                        inappropriate information.
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      5. User Conduct
                    </h2>
                    <p className="mb-2">Users agree not to:</p>
                    <ul className="list-disc pl-6 space-y-1 mb-2">
                      <li>Provide false or misleading information.</li>
                      <li>Harass, abuse, or harm other members.</li>
                      <li>
                        Use the Platform for commercial, dating, or unlawful
                        purposes.
                      </li>
                      <li>Share obscene, offensive, or illegal content.</li>
                    </ul>
                    <p>
                      Any misuse may lead to immediate termination of your
                      account.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      6. Paid Membership &amp; Payments
                    </h2>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Paid memberships provide additional features and benefits.</li>
                      <li>All fees once paid are non-refundable, unless expressly stated.</li>
                      <li>
                        Zerontechnologies reserves the right to modify pricing
                        or services at any time.
                      </li>
                      <li>All payments are subject to applicable Indian taxes.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      7. Privacy &amp; Data Protection
                    </h2>
                    <p>
                      Your personal data is handled in accordance with our
                      Privacy Policy and applicable Indian laws, including the
                      Information Technology Act and the Digital Personal Data
                      Protection Act, 2023. By using the Platform, you consent
                      to the collection and use of your information as described
                      in our Privacy Policy.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      8. Matchmaking Disclaimer
                    </h2>
                    <p>
                      PahadiMatch does not guarantee matches, responses, or
                      marriage. We do not conduct background checks or verify
                      claims made by users. Users are advised to independently
                      verify all information before proceeding. All interactions
                      are at your own discretion and risk.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      9. User Responsibility
                    </h2>
                    <p>
                      All interactions, communications, and decisions made
                      through Pahadimatch are the sole responsibility of the
                      users. Zerontechnologies Company is not responsible for
                      any offline meetings, disputes, or consequences arising
                      from user interactions.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      10. Intellectual Property
                    </h2>
                    <p>
                      All content, trademarks, logos, and software related to
                      Pahadimatch are the exclusive property of
                      Zerontechnologies Company. Unauthorized use is strictly
                      prohibited.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      11. Account Suspension or Termination
                    </h2>
                    <p>
                      Zerontechnologies Company reserves the right to suspend or
                      terminate any account that violates these Terms, without
                      prior notice.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      12. Limitation of Liability
                    </h2>
                    <p>
                      Zerontechnologies Company shall not be liable for any
                      direct or indirect loss, damages, or claims arising from
                      the use of Pahadimatch.
                    </p>
                  </section>

                  <section>
                    <h2 className="font-semibold text-text mb-2">
                      13. Governing Law
                    </h2>
                    <p>
                      These Terms shall be governed by and interpreted in
                      accordance with the laws applicable in the jurisdiction
                      where Zerontechnologies Company is registered.
                    </p>
                  </section>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                
                <img 
                  src="/pahadi_match_full.png" 
                  alt="PahadiMatch" 
                  className="w-20 h-10 hidden lg:block object-contain"
                />
                <img 
                  src="/pahadi_match_logo_mobile.png" 
                  alt="PahadiMatch" 
                  className="w-16 h-8 lg:hidden object-contain"
                />
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