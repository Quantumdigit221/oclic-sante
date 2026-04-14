import React from 'react';
import { useStore } from '../store';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Pill,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Brain,
  UserCog,
  FileBarChart2,
  Microscope,
  Building,
  Building2,
  Ticket,
  Stethoscope,
  Activity,
  ShieldCheck,
  Wallet,
  Menu as MenuIcon
} from 'lucide-react';
import { Role } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { CenterSwitcher } from './CenterSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  className?: string;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon, label, active, className = '', onClick }: SidebarItemProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${active
      ? 'bg-teal-50 text-teal-700 font-medium shadow-sm border border-teal-100'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
  >
    <span className={`${active ? 'text-teal-600' : 'text-slate-400'} flex-shrink-0`}>
      {icon}
    </span>
    <span className="truncate">{label}</span>
  </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, currentCenter, logout } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false); // Menu fermé par défaut sur mobile

  if (!currentUser) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Desktop - Visible par défaut */}
      <aside className={`
        fixed lg:fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 shadow-lg transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                <img src="/LOGO.png" alt="O'CLIC SANTE" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h1 className="font-bold text-lg text-slate-900 leading-tight truncate">O'CLIC SANTE</h1>
                <p className="text-xs text-slate-600 truncate">{currentCenter?.name || 'Administration'}</p>
              </div>
            </div>
            <div className="mt-4">
              <CenterSwitcher />
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto space-y-1">
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Principal</div>
              <SidebarItem
                to="/"
                icon={<LayoutDashboard className="w-4 h-4" />}
                label="Tableau de bord"
                active={isActive('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <SidebarItem
                to="/appointments"
                icon={<Calendar className="w-4 h-4" />}
                label="Rendez-vous"
                active={isActive('/appointments')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {[Role.ADMIN, Role.RECEPTIONIST, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/tickets"
                  icon={<Ticket className="w-4 h-4" />}
                  label="Tickets"
                  active={isActive('/tickets')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              <SidebarItem
                to="/patients"
                icon={<Users className="w-4 h-4" />}
                label="Patients"
                active={isActive('/patients')}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {[Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/consultations"
                  icon={<Stethoscope className="w-4 h-4" />}
                  label="Consultations"
                  active={isActive('/consultations')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/diagnosis-ai"
                  icon={<Brain className="w-4 h-4" />}
                  label="Diagnostic IA"
                  active={isActive('/diagnosis-ai')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.PHARMACIST, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/pharmacy"
                  icon={<Pill className="w-4 h-4" />}
                  label="Pharmacie"
                  active={isActive('/pharmacy')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.DOCTOR, Role.PHARMACIST, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/prescriptions"
                  icon={<FileText className="w-4 h-4" />}
                  label="Ordonnances"
                  active={isActive('/prescriptions')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.DOCTOR, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/exams"
                  icon={<Microscope className="w-4 h-4" />} // I need to import Microscope or use Activity
                  label="Examens"
                  active={isActive('/exams')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
            </div>

            <div>
              <div className="mt-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Administration</div>
              {currentUser.role.toUpperCase() === Role.SUPER_ADMIN && (
                <SidebarItem
                  to="/admin/centers"
                icon={<ShieldCheck className="w-4 h-4" />}
                  label="Super Admin"
                  active={isActive('/admin/centers')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {currentUser.role.toUpperCase() === Role.SUPER_ADMIN && (
                <SidebarItem
                  to="/register-center"
                  icon={<Building className="w-4 h-4" />}
                  label="Nouveau Centre"
                  active={isActive('/register-center')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/services"
                  icon={<Activity className="w-4 h-4" />}
                  label="Services"
                  active={isActive('/services')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/staff"
                  icon={<UserCog className="w-4 h-4" />}
                  label="Personnel"
                  active={isActive('/staff')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/users"
                  icon={<Users className="w-4 h-4" />}
                  label="Gestion des Utilisateurs"
                  active={isActive('/users')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/reports"
                  icon={<FileBarChart2 className="w-4 h-4" />}
                  label="Rapports"
                  active={isActive('/reports')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}

              {/* Section Finances & Stocks */}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <div>
                  <div className="mt-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Finances & Stocks</div>
                  <SidebarItem
                    to="/resources"
                    icon={<Wallet className="w-4 h-4" />}
                    label="Ressources & Dépenses"
                    active={isActive('/resources')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              )}

              {/* Section Assurances & IPM */}
              {[Role.ADMIN, Role.SUPER_ADMIN, Role.RECEPTIONIST].includes(currentUser.role.toUpperCase() as Role) && (
                <div>
                  <div className="mt-3 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assurances & IPM</div>
                  <SidebarItem
                    to="/insurance/dashboard"
                    icon={<Activity className="w-4 h-4" />}
                    label="Dashboard Assurance"
                    active={isActive('/insurance/dashboard')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <SidebarItem
                    to="/insurance/billing"
                    icon={<Ticket className="w-4 h-4" />}
                    label="Facturation Assurance"
                    active={isActive('/insurance/billing')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <SidebarItem
                    to="/insurance/claims"
                    icon={<FileText className="w-4 h-4" />}
                    label="Réclamations"
                    active={isActive('/insurance/claims')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                  <SidebarItem
                    to="/insurance/management"
                    icon={<Building className="w-4 h-4" />}
                    label="Partenaires & Compagnies"
                    active={isActive('/insurance/management')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                   <SidebarItem
                    to="/insurance/patients"
                    icon={<Users className="w-4 h-4" />}
                    label="Dossiers Patients"
                    active={isActive('/insurance/patients')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              )}

              {currentUser.role.toUpperCase() === Role.ADMIN && (
                <SidebarItem
                  to="/admin/center"
                  icon={<Building2 className="w-4 h-4" />}
                  label="Gestion du Centre"
                  active={isActive('/admin/center')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              {[Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role) && (
                <SidebarItem
                  to="/settings"
                  icon={<Settings className="w-4 h-4" />}
                  label="Paramètres"
                  active={isActive('/settings')}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-indigo-700 font-bold text-sm">
                    {currentUser.name ? currentUser.name.trim().split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2) || 'U' : 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name || 'Utilisateur'}</p>
                <p className="text-xs text-slate-500 truncate capitalize">
                  {currentUser.role?.toLowerCase().replace('_', ' ') || 'utilisateur'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/LOGO.png" alt="O'CLIC SANTE" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-slate-900 truncate">O'CLIC SANTE</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 w-full relative">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// ... (garder tout le contenu existant)
// Remplacer la dernière ligne par :
export default Layout;
