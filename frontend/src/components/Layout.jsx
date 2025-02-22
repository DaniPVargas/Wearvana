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
      <Header className="md:hidden" />
      <BottomNav />
      <div className="md:pl-[244px]">
        <div className="max-w-[1200px] mx-auto pt-[70px] md:pt-8 pb-20 md:pb-8 px-0 lg:px-6">
          <main className="flex-grow">{children}</main>
        </div>
      </div>
    </div>
  )
}

