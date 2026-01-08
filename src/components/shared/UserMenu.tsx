"use client";

import { LogOut, Settings, User, Check, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { type User as UserType, UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  user?: UserType | null;
  onLogout?: () => void;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const { activeRole, switchRole } = useAuth();
  const router = useRouter();
  
  const initials = user?.username
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    if (role === UserRole.ADMIN) {
      router.push("/admin/dashboard");
    } else {
      router.push("/vocabulary");
    }
  };

  const hasMultipleRoles = user?.roles && user.roles.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-[var(--primary-500)] hover:ring-offset-2"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={user?.username || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || "Người dùng"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Hồ sơ</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          
          {hasMultipleRoles && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="mr-2 h-4 w-4" />
                <span>Chuyển vai trò</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {user?.roles.map((role) => (
                  <DropdownMenuItem
                    key={role.id}
                    onClick={() => handleRoleSwitch(role.name)}
                    className="cursor-pointer"
                  >
                    {activeRole === role.name && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    <span className={activeRole !== role.name ? "ml-6" : ""}>
                      {role.name === UserRole.ADMIN ? "Quản trị viên" : "Người học"}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-[var(--error)] focus:text-[var(--error)]"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
