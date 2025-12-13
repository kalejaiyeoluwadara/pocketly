import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add any route-specific middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to API routes for authentication
        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true;
        }

        // Allow all other routes (modify this based on your protection needs)
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/api/:path*'],
};

