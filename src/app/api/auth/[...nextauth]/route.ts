/**
 * NextAuth v4 Route Handler
 * Delegates all /api/auth/* requests to NextAuth.
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
