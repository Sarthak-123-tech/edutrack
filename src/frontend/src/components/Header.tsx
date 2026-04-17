import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Bell, Menu, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  showMenu?: boolean;
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const roleColors: Record<string, string> = {
  admin: "bg-[oklch(var(--chart-3)/0.15)] text-[oklch(var(--chart-3))]",
  teacher: "bg-[oklch(var(--chart-1)/0.15)] text-[oklch(var(--chart-1))]",
  student: "bg-primary/10 text-primary",
};

export function Header({ title, onMenuClick, showMenu = false }: HeaderProps) {
  const { userProfile, role } = useAuthState();

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0 z-10">
      {showMenu && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          data-ocid="header.menu_button"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </Button>
      )}

      <h1 className="text-sm font-semibold font-display text-foreground flex-1 truncate">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          data-ocid="header.notifications_button"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[oklch(var(--chart-2))]" />
        </Button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          {role && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-wider font-semibold border-0 hidden sm:inline-flex",
                roleColors[role] ?? "bg-muted text-muted-foreground",
              )}
            >
              {role}
            </Badge>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                {getInitials(userProfile?.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground max-w-[120px] truncate hidden sm:block">
              {userProfile?.name ?? "User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
