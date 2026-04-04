import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { LOCALE_COOKIE_KEY, normalizeLocale } from "@/lib/i18n"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"
  const isLocaleRoute = pathname.startsWith("/zh") || pathname.startsWith("/en")

  // 如果访问后台且未登录，重定向到登录页
  if (isAdminRoute && !isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  // 如果已登录且访问登录页，重定向到后台首页
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  // 非后台页面统一挂载到 /zh 或 /en（由 cookie 决定）
  if (!isAdminRoute && !isLocaleRoute) {
    const cookieLocale = req.cookies.get(LOCALE_COOKIE_KEY)?.value
    const locale = normalizeLocale(cookieLocale)
    const target = new URL(`/${locale}${pathname === "/" ? "" : pathname}${req.nextUrl.search}`, req.url)
    return NextResponse.redirect(target)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon\\.svg|.*\\..*).*)"],
}
