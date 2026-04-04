"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useNavConfig } from "@/hooks/useNavConfig"
import { defaultNav } from "@/lib/nav-config"
import { detectLocaleFromPath, withLocalePath } from "@/lib/i18n-path"
import { oppositeLocale } from "@/lib/i18n"
import { resolveFrontendSectionVisibility } from "@/lib/page-copy"

const navItems = [
  { key: "worksDesign" as const, href: "/works/design", icon: "ri-palette-line", activeIcon: "ri-palette-fill" },
  { key: "worksDev" as const, href: "/works/development", icon: "ri-code-s-slash-line", activeIcon: "ri-code-s-slash-fill" },
  { key: "blog" as const, href: "/blog", icon: "ri-article-line", activeIcon: "ri-article-fill" },
  { key: "tutorials" as const, href: "/tutorials", icon: "ri-video-line", activeIcon: "ri-video-fill" },
  { key: "about" as const, href: "/about", icon: "ri-user-line", activeIcon: "ri-user-fill" },
]

export function BottomNav() {
  const pathname = usePathname()
  const { nav, pageCopy } = useNavConfig()
  const { theme, setTheme } = useTheme()
  const locale = detectLocaleFromPath(pathname || "/")
  const nextLocale = oppositeLocale(locale)
  const sectionVisibility = resolveFrontendSectionVisibility(pageCopy)
  const visibleNavItems = navItems.filter((item) => {
    if (item.key === "worksDesign") return sectionVisibility.worksDesign
    if (item.key === "worksDev") return sectionVisibility.worksDev
    if (item.key === "blog") return sectionVisibility.blog
    if (item.key === "tutorials") return sectionVisibility.tutorials
    return true
  })

  return (
    <nav className="bottom-nav">
      <div className="glass-strong rounded-full px-2 py-2 flex items-center gap-1 shadow-xl">
        {visibleNavItems.map((item) => {
          const label = nav[item.key] ?? (defaultNav as Record<string, string>)[item.key] ?? item.key
          const isActive =
            pathname === withLocalePath(item.href, locale) ||
            (item.href !== "/" && pathname.startsWith(withLocalePath(item.href, locale)))

          return (
            <Link
              key={item.href}
              href={withLocalePath(item.href, locale)}
              aria-label={label}
              title={label}
              className={cn(
                "flex items-center justify-center p-3 rounded-full transition-all duration-200 active:scale-95",
                isActive
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <i className={`${isActive ? item.activeIcon : item.icon} text-xl`} />
            </Link>
          )
        })}
        <div className="w-px h-5 bg-foreground/15 mx-0.5" />
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 active:scale-95"
        >
          <i className="ri-sun-line dark:hidden text-xl" />
          <i className="ri-moon-line hidden dark:inline text-xl" />
        </button>
        <Link
          href={withLocalePath(pathname || "/", nextLocale)}
          onClick={async () => {
            await fetch("/api/locale", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ locale: nextLocale }),
            }).catch(() => {})
          }}
          className="flex items-center justify-center p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 active:scale-95"
        >
          <i className="ri-translate-2 text-xl" />
        </Link>
      </div>
    </nav>
  )
}
