import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  return (
    <div className="app-shell min-h-screen overflow-hidden text-cloud">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-28 border-b border-white/10 bg-ink/45 backdrop-blur-xl" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-14 pt-5 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="relative z-10 border-t border-white/10 px-4 py-6 text-center text-sm text-cloud/52">
          Teacher Support AI / Ұстазға көмек AI - emotional wellbeing product for teachers
        </footer>
      </div>
    </div>
  );
}
