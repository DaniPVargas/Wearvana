export default function Header({ className = '' }) {
  return (
    <header className={`fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-200 z-40 ${className}`}>
      <div className="h-full max-w-[1200px] mx-auto px-4 flex items-center justify-center">
        <h1 className="text-xl tracking-widest font-light">WEARVANA</h1>
      </div>
    </header>
  )
}

