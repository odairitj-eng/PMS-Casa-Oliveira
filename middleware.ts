import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
        const userRole = token?.role as string;

        if (isAdminRoute && !["ADMIN", "CO_ADMIN"].includes(userRole)) {
            const url = req.nextUrl.clone();
            url.pathname = "/auth/login";
            return NextResponse.redirect(url);
        }

        const response = NextResponse.next();

        // 🛡️ HEADERS DE SEGURANÇA (PRODUÇÃO HARDENING)
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.mercadopago.com https://*.vercel-scripts.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            img-src 'self' blob: data: https://*.mercadopago.com https://*.githubusercontent.com https://*.googleusercontent.com https://*.airbnb.com https://*.muscache.com https://*.fbsbx.com https://*.fbcdn.net;
            font-src 'self' https://fonts.gstatic.com;
            object-src 'none';
            base-uri 'self';
            form-action 'self' https://*.mercadopago.com;
            frame-ancestors 'none';
            block-all-mixed-content;
            upgrade-insecure-requests;
        `.replace(/\s{2,}/g, ' ').trim();

        response.headers.set('Content-Security-Policy', cspHeader);
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');

        return response;
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
        "/profile",
        "/profile/:path*",
        "/admin",
        "/admin/:path*"
    ],
};
