import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/drivepipe-logo.png";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leads", label: "Leads", icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              isActive(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <img src={logo} alt="DrivePipe" className="h-8 w-auto mr-2" />
          <span className="text-xl font-bold">DrivePipe</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavLinks />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <img src={logo} alt="DrivePipe" className="h-8 w-auto mr-2" />
                <span className="text-xl font-bold">DrivePipe</span>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user?.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="font-medium">{user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
