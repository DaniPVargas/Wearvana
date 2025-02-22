"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import Header from "./Header"
import BottomNav from "./BottomNav"

export default function Layout({ children }) {
  const location = useLocation()
  const isAuthPage = ['/login', '/register'].includes(location.pathname)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("Service worker registered:", reg))
        .catch((err) => console.log("Service worker registration failed:", err))
    }
  }, [])

  return (
    <div className={`min-h-screen bg-white ${isAuthPage ? 'flex flex-col' : ''}`}>
      <Header className={isAuthPage ? '' : 'md:hidden'} />
      {!isAuthPage && <BottomNav />}
      <div className={isAuthPage ? 'flex-1 flex items-center justify-center' : 'md:pl-[244px]'}>
        <div className={`max-w-[1200px] mx-auto ${isAuthPage ? '' : 'pt-[70px] md:pt-8 pb-20 md:pb-8'} px-0 lg:px-6 w-full`}>
          <main className={`${isAuthPage ? '' : 'flex-grow'}`}>{children}</main>
        </div>
      </div>
    </div>
  )
}

