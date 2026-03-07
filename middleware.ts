import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

        if (isAdminRoute && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Rotas que exigem login (qualquer usuário)
                const protectedRoutes = ["/checkout", "/payment"];
                const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

                // Rotas administrativas
                const isAdminRoute = pathname.startsWith("/admin");

                if (isProtected || isAdminRoute) {
                    return !!token;
                }

                return true;
            },
        },
        pages: {
            signIn: "/auth/login",
        },
    }
);

export const config = {
    matcher: [
        "/checkout",
        "/checkout/:path*",
        "/payment/:path*",
        "/admin",
        "/admin/:path*"
    ],
};
