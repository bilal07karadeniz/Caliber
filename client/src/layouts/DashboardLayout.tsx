import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-5 md:p-8 ml-0 md:ml-56">{children}</main>
      </div>
    </div>
  );
}
