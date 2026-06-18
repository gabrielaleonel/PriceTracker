"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "./theme-toggle"
import { LocaleToggle } from "./locale-toggle"
import { useLocale } from "@/lib/locale-context"

import { Plane, UserPlus, Menu, Search, Building2, LayoutDashboard, LogOut, Settings } from "lucide-react"

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary/10 text-primary shadow-xs"
          : "text-muted-foreground hover:bg-secondary/65 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, icon: Icon, children }: { href: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/65 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}

export function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/25">
              <Plane className="h-5 w-5" />
            </span>
            <span className="tracking-normal">PriceTracker</span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-lg border border-border/70 bg-card/60 p-1 text-sm font-medium shadow-sm md:flex">
            <NavLink href="/" active={pathname === "/"}>{t("nav.search")}</NavLink>
            <NavLink href="/airports" active={pathname.startsWith("/airports")}>{t("nav.airports")}</NavLink>
            {session && (
              <NavLink href="/dashboard" active={pathname.startsWith("/dashboard")}>{t("nav.dashboard")}</NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-8" />
                }
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Abrir menu</span>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                  <div className="flex items-center gap-2.5 border-b border-border pb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                      <Plane className="h-4 w-4" />
                    </span>
                    <span className="text-base font-bold text-foreground">PriceTracker</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    <MobileNavLink href="/" icon={Search}>{t("nav.search")}</MobileNavLink>
                    <MobileNavLink href="/airports" icon={Building2}>{t("nav.airports")}</MobileNavLink>
                    {session && (
                      <>
                        <MobileNavLink href="/dashboard" icon={LayoutDashboard}>{t("nav.dashboard")}</MobileNavLink>
                        <MobileNavLink href="/dashboard/config" icon={Settings}>{t("nav.settings")}</MobileNavLink>
                        <div className="mt-2 border-t border-border pt-2">
                          <button
                            type="button"
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/65 hover:text-foreground"
                          >
                            <LogOut className="h-4 w-4" />
                            {t("nav.signOut")}
                          </button>
                        </div>
                      </>
                    )}
                    {!session && (
                      <div className="mt-2 border-t border-border pt-2">
                        <MobileNavLink href="/login" icon={UserPlus}>{t("nav.signIn")}</MobileNavLink>
                      </div>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <LocaleToggle />
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none size-8 hover:bg-muted data-open:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  {t("nav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/config")}>
                  {t("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                {t("nav.signIn")}
              </Button>
              <Button size="sm" onClick={() => router.push("/register")}>
                <UserPlus className="h-3.5 w-3.5" />
                {t("nav.createAccount")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
