"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Search, PenSquare, Bell, Bookmark, User, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-serif font-bold text-gray-900 tracking-tight">WriteIt</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/write"
                  className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition"
                >
                  <PenSquare className="w-4 h-4" />
                  Write
                </Link>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1 focus:outline-none"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                        <Link
                          href={`/u/${user.username}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link
                          href="/write"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <PenSquare className="w-4 h-4" /> Write a story
                        </Link>
                        <Link
                          href="/bookmarks"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Bookmark className="w-4 h-4" /> Bookmarks
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" /> Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={() => { logout(); setShowUserMenu(false); router.push("/"); }}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
