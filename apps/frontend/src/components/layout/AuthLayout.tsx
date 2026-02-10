import {useEffect, useState} from "react";
import Logo from "~/assets/logo.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
}

export const AuthLayout = ({
  children,
  maxWidth = "max-w-[420px]",
}: AuthLayoutProps) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0,
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Pure Source Code Management",
      description:
        "GitShelf is a dedicated Source Code Manager (SCM), designed for simplicity and performance, unlike complex platforms like GitHub.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      title: "Self-Hosted & Private",
      description:
        "Keep full control over your code. Host it on your own infrastructure with complete privacy and no third-party tracking.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      title: "Lightweight & Fast",
      description:
        "A streamlined experience focused purely on code collaboration, without the bloat of social networking features.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const {innerWidth, innerHeight} = window;
      const centerX = (e.clientX - innerWidth / 2) / 25;
      const centerY = (e.clientY - innerHeight / 2) / 25;
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        centerX,
        centerY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-app-bg relative overflow-hidden">
      {/* Left Panel - Info & Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-3/4 relative flex-col justify-between p-16 bg-app-surface  overflow-hiddenX">
        {/* Background Effects (Left Side) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-app-accent/10 rounded-full blur-[120px] animate-pulse transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translate(${-mousePosition.centerX}px, ${-mousePosition.centerY}px)`,
            }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-app-accent/10 rounded-full blur-[120px] animate-pulse delay-700 transition-transform duration-100 ease-out will-change-transform"
            style={{
              transform: `translate(${mousePosition.centerX}px, ${mousePosition.centerY}px)`,
            }}
          />
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        </div>

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={Logo} alt="GitShelf" className="w-8 h-8" />
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">
              GitShelf
            </span>
          </div>

          <div className="space-y-8 max-w-2xl mb-auto font-display">
            <h1 className="text-4xl lg:text-6xl font-bold text-text-primary tracking-tight leading-tight">
              Simple, Fast <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-app-accent to-app-accent-hover">
                Source Code Manager
              </span>
            </h1>

            {/* Auto-sliding Info */}
            <div className="relative h-48 mt-12">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8"
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-app-accent mb-2">
                      <h3 className="text-xl lg:text-3xl font-bold text-text-primary">
                        {slide.title}
                      </h3>
                    </div>
                    <p className="text-base lg:text-xl text-text-secondary leading-relaxed max-w-xl">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex gap-3 mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-12 bg-app-accent shadow-[0_0_10px] shadow-app-accent/50"
                      : "w-3 bg-app-border hover:bg-text-tertiary hover:w-4"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Footer/Copyright */}
          <div className="relative z-10 text-sm text-text-tertiary mt-8">
            © {new Date().getFullYear()} GitShelf Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Form (Mobile: Full Screen, Desktop: Half Screen) */}
      <div className="w-full lg:w-1/4 flex flex-col relative z-10 h-[100dvh] overflow-y-auto bg-gradient-to-br from-app-bg to-app-surface">
        {/* Spotlight Effect (Global/Right side focused) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(66, 133, 244, 0.03), transparent 40%)`,
          }}
        />

        {/* Mobile Background Decor (Hidden on Desktop) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-app-accent/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-app-accent/5 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div
          className={`w-full ${maxWidth} flex flex-col justify-center flex-1 relative z-10 mx-auto px-6 py-8 lg:px-0 lg:py-12 lg:m-auto`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
