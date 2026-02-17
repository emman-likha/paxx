import Link from "next/link";
import { Shield, Check, Star, Zap, Crown, ShieldCheck, Lock, Smartphone, RefreshCw, Layers, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { HeroBackground } from "@/components/hero-background";

export default function Home() {
  return (
    <div className="flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Section 1: Hero */}
        <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden border-b py-20 lg:py-0">
          <div className="container mx-auto px-4 text-center md:px-8 relative z-10">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,1)]">
              Secure your digital life with <span className="text-primary">Paxx</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
              The modern password manager for teams and individuals.
              Store, share, and manage your credentials with industry-leading security.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-14 px-10 text-lg shadow-lg shadow-primary/20">
                  Get Started for Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-10 text-lg">
                View Features
              </Button>
            </div>
            <div className="mt-16 text-muted-foreground animate-bounce">
              <MousePointerClick className="mx-auto size-6 rotate-180" />
            </div>
          </div>
          <HeroBackground />
        </section>

        {/* Section 2: Features */}
        <section id="features" className="flex min-h-screen items-center justify-center border-b bg-muted/30 py-20 lg:py-0">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Powerful Features</h2>
              <p className="mt-4 text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                Everything you need to manage your passwords effortlessly across all your devices.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Lock className="size-8" />,
                  title: "Secure Storage",
                  desc: "Store unlimited passwords, notes, and cards in your encrypted vault."
                },
                {
                  icon: <RefreshCw className="size-8" />,
                  title: "Real-time Sync",
                  desc: "Instantly access your data on desktop, mobile, and browser extensions."
                },
                {
                  icon: <Layers className="size-8" />,
                  title: "Organization",
                  desc: "Keep your vault clean with folders, tags, and powerful search tools."
                },
                {
                  icon: <ShieldCheck className="size-8" />,
                  title: "Password Generator",
                  desc: "Create complex, unique passwords for every account with one click."
                },
                {
                  icon: <Smartphone className="size-8" />,
                  title: "Auto-fill",
                  desc: "Log in to your favorite sites and apps instantly with secure auto-fill."
                },
                {
                  icon: <Zap className="size-8" />,
                  title: "Swift Sharing",
                  desc: "Securely share credentials with family or team members in real-time."
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col rounded-2xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Security */}
        <section id="security" className="flex min-h-screen items-center justify-center border-b py-20 lg:py-0">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Military-Grade Security</h2>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                  Paxx uses zero-knowledge architecture. Your data is encrypted locally on your device before it ever reaches our servers.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "AES-256 bit end-to-end encryption",
                    "Argon2 key derivation for master passwords",
                    "Two-factor authentication (2FA) support",
                    "Biometric unlock on mobile devices",
                    "Secure, audited server infrastructure"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative flex aspect-square items-center justify-center rounded-3xl bg-muted overflow-hidden">
                <ShieldCheck className="size-48 text-primary/20 absolute" />
                <div className="relative z-10 text-center">
                  <div className="inline-block rounded-2xl bg-primary px-6 py-4 shadow-2xl">
                    <Lock className="mx-auto size-12 text-primary-foreground" />
                    <p className="mt-2 font-bold text-primary-foreground">Your Key Only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Pricing */}
        <section id="pricing" className="flex min-h-screen items-center justify-center border-b bg-muted/30 py-20 lg:py-0">
          <div className="container mx-auto px-4 md:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Choose Your Plan</h2>
              <p className="mt-4 text-muted-foreground text-lg md:text-xl">
                Upgrade to unlock more features and storage
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4 lg:gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="group relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:shadow-xl">
                <div className="mb-6 flex items-center justify-center">
                  <div className="rounded-full bg-muted p-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Star className="size-6" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Essential password management</p>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₱0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">30 credentials</p>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  {["30 password storage", "2FA protection", "Folder lock", "256-bit encryption", "Password generator", "Basic support"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="size-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant="outline">Get Started Free</Button>
              </div>

              {/* Plus Plan */}
              <div className="group relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg transition-all hover:shadow-2xl scale-105 z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground uppercase tracking-wider">
                  Most Popular
                </div>
                <div className="mb-6 flex items-center justify-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Zap className="size-6" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Plus</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Advanced features for professionals</p>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₱49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">100 credentials</p>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  {["100 password storage", "All security features", "Priority support", "Advanced analytics", "Export/Import"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium">
                      <Check className="size-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full shadow-md">Get Plus</Button>
              </div>

              {/* Pro Plan */}
              <div className="group relative flex flex-col rounded-2xl border bg-card p-8 transition-all hover:shadow-xl">
                <div className="mb-6 flex items-center justify-center">
                  <div className="rounded-full bg-muted p-3 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Crown className="size-6" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Complete solution for teams</p>
                  <div className="mt-6 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₱149</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">Unlimited</p>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  {["Unlimited password storage", "Family sharing (up to 6 users)", "Advanced security features", "Enterprise features", "Priority support"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="size-4 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant="outline">Get Pro</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Final CTA */}
        <section className="flex min-h-[60vh] md:min-h-screen items-center justify-center py-20 lg:py-0 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center md:px-8">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ready to secure your digital life?
            </h2>
            <p className="mt-6 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of users who trust Paxx to protect their most sensitive information.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <Button size="lg" variant="secondary" className="h-16 px-12 text-xl font-bold">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Paxx</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground font-medium">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
          <div className="pt-8 border-t text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Paxx Password Manager. All rights reserved. Built for security.
          </div>
        </div>
      </footer>
    </div>
  );
}
