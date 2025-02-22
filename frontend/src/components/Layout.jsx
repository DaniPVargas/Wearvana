"use client"

import { useEffect } from "react"
import Header from "./Header"
import BottomNav from "./BottomNav"

export default function Layout({ children }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("Service worker registered:", reg))
        .catch((err) => console.log("Service worker registration failed:", err))
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-[1200px] mx-auto pt-[70px] pb-20 px-0 lg:px-6">
        <main className="flex-grow">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}

