import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Brain, Zap, Target, BarChart2, Code2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Math", icon: Brain, color: "bg-indigo-50 text-indigo-600" },
  { name: "Computer Science", icon: Code2, color: "bg-cyan-50 text-cyan-600" },
  { name: "Logic", icon: Target, color: "bg-emerald-50 text-emerald-600" },
  { name: "Data Analysis", icon: BarChart2, color: "bg-amber-50 text-amber-600" },
  { name: "Science", icon: FlaskConical, color: "bg-rose-50 text-rose-600" },
];

const features = [
  {
    title: "Learn by Doing",
    description: "No passive watching. Every concept is taught through interactive challenges that demand real thinking.",
    icon: Zap,
  },
  {
    title: "Instant Feedback",
    description: "Know immediately if you got it right — and more importantly, understand exactly why.",
    icon: Target,
  },
  {
    title: "Track Your Progress",
    description: "Earn XP, build streaks, and see your knowledge compound over time.",
    icon: BarChart2,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Luminary</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" data-testid="link-sign-in">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" data-testid="link-sign-up">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-3.5 h-3.5" />
              Active learning, not passive watching
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6"
          >
            Learn by{" "}
            <span className="text-primary">doing</span>,<br />
            understand by{" "}
            <span className="text-secondary">thinking</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Luminary replaces passive study with interactive challenges that demand real thinking.
            Every lesson is a discovery — not a lecture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="gap-2 text-base px-8 h-12" data-testid="button-get-started">
                Start learning free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-base px-8 h-12" data-testid="button-sign-in-hero">
                Already have an account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider mb-8">
            Explore subjects
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ scale: 1.03 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium cursor-pointer ${cat.color}`}
                data-testid={`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive card preview */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-5">
              One challenge at a time
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Instead of scrolling through a wall of text, you solve carefully designed problems
              that build on each other. Each one teaches exactly one insight — and makes it stick.
            </p>
            <ul className="space-y-4">
              {["Multiple choice challenges with instant explanations", "True/false with detailed reasoning", "Numeric inputs that reveal surprising answers"].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 text-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Mock challenge card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-card-border rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="h-1.5 bg-muted">
              <div className="h-full w-1/3 bg-primary rounded-full" />
            </div>
            <div className="p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Probability — Challenge 1 of 3
              </p>
              <h3 className="text-xl font-semibold mb-2">The Gambler's Fallacy</h3>
              <p className="text-foreground mb-6">
                You flip a fair coin 5 times and get Heads every time. What is the probability the next flip is Tails?
              </p>
              <div className="space-y-3">
                {[
                  { label: "A", text: "Greater than 50% — Tails is due", correct: false },
                  { label: "B", text: "Exactly 50% — each flip is independent", correct: true },
                  { label: "C", text: "Less than 50% — Heads is on a streak", correct: false },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      opt.correct
                        ? "bg-secondary/10 border-secondary/40 text-secondary"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${opt.correct ? "bg-secondary text-white" : "bg-muted"}`}>
                      {opt.label}
                    </span>
                    <span className="text-sm">{opt.text}</span>
                  </div>
                ))}
              </div>
              {/* Explanation */}
              <div className="mt-6 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                <p className="text-sm font-medium text-secondary mb-1">Correct!</p>
                <p className="text-sm text-muted-foreground">Each coin flip is independent. The coin has no memory of past outcomes — always 50/50.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-14">
            Why Luminary works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-card-border rounded-2xl p-7"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-5">
            Start your first lesson today
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Free to start. No credit card required. Just curiosity.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="gap-2 text-base px-10 h-12" data-testid="button-cta-bottom">
              Begin learning
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded flex items-center justify-center">
              <Brain className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">Luminary</span>
          </div>
          <p>Interactive learning, beautifully designed</p>
        </div>
      </footer>
    </div>
  );
}
