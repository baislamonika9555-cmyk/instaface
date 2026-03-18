import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Lessons", href: "/#learning-path" },
  { label: "Practice", href: "/practice" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Support", href: "/#support" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 min-h-[44px]"
            data-ocid="header.link"
          >
            <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center text-white font-bold text-lg relative">
              E
              <span className="absolute -top-1 -right-1 text-[10px] font-black text-orange bg-white rounded-full w-4 h-4 flex items-center justify-center leading-none shadow-sm">
                x
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[15px] text-foreground tracking-tight">
                Math Expo
              </span>
              <span className="font-semibold text-[11px] text-teal tracking-wide uppercase">
                Learn Exponents
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-teal transition-colors rounded-md hover:bg-teal/5 min-h-[44px] flex items-center"
                data-ocid="header.link"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-5 border-teal text-teal hover:bg-teal hover:text-white"
              data-ocid="header.login_button"
            >
              Log In
            </Button>
            <Button
              size="sm"
              className="rounded-full px-5 bg-teal text-white hover:bg-teal-dark"
              data-ocid="header.signup_button"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile menu toggle — 44×44 touch target */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:text-teal hover:bg-teal/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            data-ocid="header.toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-white"
          >
            <nav
              className="px-4 py-3 flex flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 text-base font-medium text-muted-foreground hover:text-teal rounded-xl hover:bg-teal/5 transition-colors min-h-[52px] flex items-center"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-3 pb-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-teal text-teal h-12 text-base"
                  data-ocid="header.login_button"
                >
                  Log In
                </Button>
                <Button
                  className="flex-1 rounded-full bg-teal text-white h-12 text-base"
                  data-ocid="header.signup_button"
                >
                  Sign Up
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
