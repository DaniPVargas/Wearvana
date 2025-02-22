import { Search, ShoppingBag } from "lucide-react"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center h-[60px] px-6 relative">
          <div className="w-[52px]"></div>
          
          <h1 className="text-xl tracking-widest font-light absolute left-1/2 -translate-x-1/2">WEARVANA</h1>
          
          <div className="flex items-center gap-8 pr-2">
              <Search className="h-4 w-4" />
              <ShoppingBag className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  )
}

