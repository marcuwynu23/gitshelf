import {
  CodeBracketIcon,
  HeartIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-2">
      {/* Hero Section */}
      <div className="text-center mb-16 animate-slideUp">
        <div className="inline-flex items-center justify-center p-3 bg-app-accent/10 rounded-full mb-6">
          <SparklesIcon className="w-6 h-6 text-app-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
          Building the future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-app-accent to-purple-500">
            code collaboration
          </span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          GitShelf is a modern, fast, and secure source code management platform
          designed for developers who value simplicity, performance, and a
          distraction-free workflow.
        </p>
      </div>

      {/* Stats/Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slideUp" style={{animationDelay: "100ms"}}>
        <div className="text-center p-6 rounded-2xl bg-app-surface border border-app-border">
          <div className="text-3xl font-bold text-text-primary mb-2">100%</div>
          <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Open Source</div>
        </div>
        <div className="text-center p-6 rounded-2xl bg-app-surface border border-app-border">
          <div className="text-3xl font-bold text-text-primary mb-2">Fast</div>
          <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">Performance</div>
        </div>
        <div className="text-center p-6 rounded-2xl bg-app-surface border border-app-border">
          <div className="text-3xl font-bold text-text-primary mb-2">Secure</div>
          <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">By Default</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 animate-slideUp" style={{animationDelay: "200ms"}}>
        <div className="group p-6 rounded-2xl bg-app-surface border border-app-border hover:border-app-accent/50 hover:shadow-lg hover:shadow-app-accent/5 transition-all duration-300">
          <div className="w-12 h-12 bg-app-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <CodeBracketIcon className="w-6 h-6 text-app-accent" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            Built for Developers
          </h3>
          <p className="text-text-secondary leading-relaxed">
            A clean, distraction-free interface for managing your repositories,
            reviewing code, and collaborating with your team without the clutter.
          </p>
        </div>

        <div className="group p-6 rounded-2xl bg-app-surface border border-app-border hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            Secure by Design
          </h3>
          <p className="text-text-secondary leading-relaxed">
            Enterprise-grade security with robust authentication, granular access
            controls, and secure communication channels to protect your intellectual property.
          </p>
        </div>

        <div className="group p-6 rounded-2xl bg-app-surface border border-app-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <GlobeAltIcon className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            Open Source
          </h3>
          <p className="text-text-secondary leading-relaxed">
            Built on open-source technologies with a belief in transparency.
            Community-driven development ensures we solve real-world problems.
          </p>
        </div>

        <div className="group p-6 rounded-2xl bg-app-surface border border-app-border hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300">
          <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <HeartIcon className="w-6 h-6 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-3">
            User Focused
          </h3>
          <p className="text-text-secondary leading-relaxed">
            We listen to our users. Every feature is thoughtfully designed to
            improve your development workflow and make coding enjoyable again.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-app-border pt-8 text-center animate-slideUp" style={{animationDelay: "300ms"}}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <BoltIcon className="w-5 h-5 text-yellow-500" />
          <span className="text-text-primary font-medium">Powered by Modern Tech</span>
        </div>
        <p className="text-text-tertiary text-sm mb-2">
          Version 1.0.0
        </p>
        <p className="text-text-tertiary text-sm">
          &copy; {new Date().getFullYear()} GitShelf Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
