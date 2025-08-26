"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ModeToggle } from "@/components/ToggleTheme/page";
import { Menu, X, MessageSquare, Upload, BarChart3 } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const navLinks = [
    { href: "/dashboard", label: "Chat", icon: MessageSquare },
    { href: "/admin", label: "Admin", icon: Upload },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg sm:text-xl">VTT Chatbot</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <SignedIn>
            <div className="flex items-center space-x-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </SignedIn>
        </div>

        {/* Desktop Auth & Theme */}
        <div className="hidden md:flex items-center space-x-4">
          <ModeToggle />
          
          <SignedOut>
            <div className="flex items-center space-x-2">
              <SignInButton>
                <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ModeToggle />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 py-4 space-y-4">
            <SignedIn>
              <div className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Account</span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </div>
              </div>
            </SignedIn>

            <SignedOut>
              <div className="space-y-2">
                <SignInButton>
                  <button className="w-full flex justify-center px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="w-full flex justify-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      )}
    </nav>
  );
}
