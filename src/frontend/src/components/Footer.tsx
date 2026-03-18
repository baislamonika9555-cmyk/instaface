import { SiGithub, SiLinkedin, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <footer className="bg-footer border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold relative">
                E
                <span className="absolute -top-1 -right-1 text-[9px] font-black text-orange bg-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                  x
                </span>
              </div>
              <span className="font-bold text-sm text-foreground">
                Exponent Master
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Master exponent rules through structured lessons and interactive
              practice.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-teal transition-colors"
              >
                <SiGithub size={18} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-teal transition-colors"
              >
                <SiX size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground hover:text-teal transition-colors"
              >
                <SiLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Learn
            </h4>
            <ul className="space-y-2">
              {[
                "Basic Exponents",
                "Product Rule",
                "Quotient Rule",
                "Power Rule",
                "Negative Exponents",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="/practice"
                    className="text-xs text-muted-foreground hover:text-teal transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Features", href: "/#features" },
                { label: "Practice", href: "/practice" },
                { label: "Dashboard", href: "/dashboard" },
                { label: "Progress Tracking", href: "/dashboard" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-teal transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Support
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Help Center", href: "/#support" },
                { label: "Contact Us", href: "/#support" },
                { label: "Privacy Policy", href: "/" },
                { label: "Terms of Service", href: "/" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-xs text-muted-foreground hover:text-teal transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
