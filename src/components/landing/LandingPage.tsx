import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  BarChart2,
  Target,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary p-1 glow">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold glow-text">Mental Bank</span>
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="glass-input hover:glow-border"
              >
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="glass-button glow">Sign Up</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Transform Your Mindset,
              <span className="text-primary block glow-text">
                Grow Your Mental Bank
              </span>
            </h1>
            <p className="text-lg text-foreground/80">
              Track high-value activities, reinforce positive financial
              programming, and watch your mental bank balance grow
              exponentially.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button size="lg" className="glass-button glow gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-input hover:glow-border"
                >
                  Log In to Your Account
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl"></div>
            <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10">
              <div className="p-6 bg-glass-dark border-b border-white/5">
                <h3 className="text-lg font-medium">Mental Bank Dashboard</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-primary/10 glass rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Current Balance</span>
                    <span className="text-xl font-bold glow-text">$12,450</span>
                  </div>
                  <div className="h-2 bg-glass-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary animate-pulse-glow"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Target: $20,000</span>
                    <span>65% Complete</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      <span className="font-medium">Daily Growth</span>
                    </div>
                    <span className="text-xl font-bold glow-text">$350</span>
                  </div>
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">Tasks</span>
                    </div>
                    <span className="text-xl font-bold glow-text">
                      12 Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-accent/20 glass-nav py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 glow-text">
              Transform Your Financial Mindset
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Our Mental Bank system helps you track high-value activities and
              reinforce positive financial programming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg">
              <div className="rounded-full bg-primary/20 glass p-3 w-12 h-12 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Track Your Mental Bank Balance
              </h3>
              <p className="text-foreground/80">
                Monitor your mental bank balance growth and progress toward your
                3X goal with intuitive visualizations.
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="rounded-full bg-primary/20 glass p-3 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Visualize Your Progress
              </h3>
              <p className="text-foreground/80">
                See your daily, weekly, and monthly growth with beautiful charts
                that keep you motivated.
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="rounded-full bg-primary/20 glass p-3 w-12 h-12 flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Set and Achieve Goals</h3>
              <p className="text-foreground/80">
                Create meaningful financial goals with milestones and track your
                progress toward achieving them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 glow-text">
              What Our Users Say
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Join thousands of people who have transformed their financial
              mindset with Mental Bank.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                  alt="User"
                  className="w-12 h-12 rounded-full mr-4 ring-2 ring-primary/50"
                />
                <div>
                  <h4 className="font-bold">John D.</h4>
                  <p className="text-foreground/60 text-sm">
                    Marketing Executive
                  </p>
                </div>
              </div>
              <p className="text-foreground/80">
                "The Mental Bank system has completely changed how I think about
                my time and value. I've increased my income by 40% in just 6
                months."
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
                  alt="User"
                  className="w-12 h-12 rounded-full mr-4 ring-2 ring-primary/50"
                />
                <div>
                  <h4 className="font-bold">Sarah M.</h4>
                  <p className="text-foreground/60 text-sm">
                    Freelance Designer
                  </p>
                </div>
              </div>
              <p className="text-foreground/80">
                "As a freelancer, tracking my high-value activities has been
                game-changing. I now focus on what truly matters and my mental
                bank balance reflects it."
              </p>
            </div>

            <div className="glass-card p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
                  alt="User"
                  className="w-12 h-12 rounded-full mr-4 ring-2 ring-primary/50"
                />
                <div>
                  <h4 className="font-bold">Michael T.</h4>
                  <p className="text-foreground/60 text-sm">
                    Small Business Owner
                  </p>
                </div>
              </div>
              <p className="text-foreground/80">
                "The goal tracking and visualization features keep me
                accountable. I've achieved more in the last year than in the
                previous three combined."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-glass py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 glow-text">
            Ready to Transform Your Financial Mindset?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-foreground/90">
            Join thousands of users who are growing their mental bank balance
            and achieving their financial goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="glass-button glow gap-2">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="glass-input hover:glow-border"
              >
                Log In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background/95 glass-nav py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="rounded-full bg-primary p-1 glow">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground glow-text">
                  Mental Bank
                </span>
              </div>
              <p className="text-sm text-foreground/70">
                Transform your financial mindset and grow your mental bank
                balance with our powerful tracking tools.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Task Management
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Categories
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Progress Charts
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Goals
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Journal
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-sm text-center text-foreground/50">
            &copy; {new Date().getFullYear()} Mental Bank Balance System. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
