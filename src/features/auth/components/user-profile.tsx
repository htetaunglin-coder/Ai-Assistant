"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@mijn-ui/react"
import { ExternalLink, FileSpreadsheet, LogOut, Moon, Settings, Sun } from "lucide-react"
import { ThemeToggler } from "@/components/ui/theme-toggler"
import { logout } from "../api/action"
import { useAuthStore } from "../stores/auth-store-provider"

const UserProfile = () => {
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await logout()
    router.push("/login")
  }

  if (user) {
    return (
      <Dialog>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative size-8 rounded-full">
              <Avatar size="2xs">
                <AvatarImage src={user?.image ?? ""} alt={user?.username ?? ""} />
                <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 !duration-150" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-4 pt-4 text-xs font-normal text-secondary-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuItem className="h-fit px-4 py-2">
                <Avatar size="xs">
                  <AvatarImage src={user?.image ?? ""} alt={user?.username ?? ""} />
                  <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <span className="text-xs font-light text-secondary-foreground">Free</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild className="cursor-pointer px-3 py-2">
                <ThemeToggler className="group w-full rounded-none bg-transparent" unstyled>
                  <div className="hidden items-center gap-2 group-data-[active-theme=light]:flex">
                    <Moon className="text-secondary-foreground" />
                    Dark
                  </div>
                  <div className="hidden items-center gap-2 group-data-[active-theme=dark]:flex">
                    <Sun className="text-secondary-foreground" />
                    Light
                  </div>
                </ThemeToggler>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer px-3 py-2 text-secondary-foreground focus:text-foreground">
                <FileSpreadsheet />
                My Files
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer px-3 py-2 text-secondary-foreground focus:text-foreground">
                <ExternalLink />
                Help & FAQ
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer px-3 py-2 text-secondary-foreground focus:text-foreground">
                <Settings />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              asChild
              className="cursor-pointer px-3 py-2 text-danger-emphasis focus:text-danger-emphasis">
              <DialogTrigger unstyled className="w-full">
                <LogOut />
                Log out
              </DialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Confirm logout</DialogTitle>
              <DialogDescription>Are you sure you want to log out?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose type="button" asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button variant="primary">Log out</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button asChild>
        <Link href={"/login"}>Log in</Link>
      </Button>
      <ThemeToggler />
    </div>
  )
}

export { UserProfile }
