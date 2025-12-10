import { NextAuthOptions } from"next-auth";
import CredentialsProvider from"next-auth/providers/credentials";
import bcrypt from"bcryptjs";
import { prisma } from"@/lib/prisma";
import { getSettingAsNumber } from"@/lib/services/settings-service";

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({
    name:"credentials",
    credentials: { email: { label:"Email", type:"email" }, password: { label:"Password", type:"password" } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) throw new Error("Invalid credentials");
      
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { 
          id: true, 
          email: true, 
          password: true, 
          name: true, 
          role: true, 
          image: true, 
          isActive: true,
          phone: true,
          phoneVerified: true,
          leadSubmissionCount: true,
          leadSubmissionLimit: true,
          installerVerified: true,
          sessionVersion: true, // Auth Part A+B: for session invalidation
          profileComplete: true, // Auth Part A+B: installer onboarding gate
        },
      });

      if (!user?.password) throw new Error("Invalid credentials");
      const valid = await bcrypt.compare(credentials.password, user.password);
      if (!valid) throw new Error("Invalid credentials");
      if (!user.isActive) throw new Error("Account deactivated");

      prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() }, select: { id: true } }).catch(console.error);

      let quoteLimit = user.leadSubmissionLimit ?? null;
      if (quoteLimit === null || quoteLimit === undefined) {
        try {
          quoteLimit = await getSettingAsNumber('MAX_LEAD_SUBMISSIONS_TOTAL');
        } catch (err) {
          console.error('[NextAuth] Failed to load MAX_LEAD_SUBMISSIONS_TOTAL setting:', err);
          quoteLimit = 5;
        }
      }

      // IMPORTANT: Only include image URL in JWT, never base64-encoded images
      // Base64 images should be stored elsewhere or fetched separately
      return { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        image: user.image, // Safe now - admin has null image
        phone: user.phone,
        phoneVerified: user.phoneVerified || false,
        leadSubmissionCount: user.leadSubmissionCount || 0,
        installerVerified: user.installerVerified || false,
        quoteLimit: quoteLimit ?? 5,
        sessionVersion: user.sessionVersion || 0, // Auth Part A+B
        profileComplete: user.profileComplete || false, // Auth Part A+B
      };
    },
  })],
  session: { 
    strategy:"jwt", 
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: { 
    signIn:"/",
    error:"/admin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On sign in, add user data to token
      if (user) { 
        token.id = user.id;
        token.role = user.role || 'HOMEOWNER';
        token.email = user.email || '';
        token.name = user.name || '';
        token.image = user.image || null;
        token.phone = user.phone || null;
        token.phoneVerified = user.phoneVerified || false;
        token.leadSubmissionCount = user.leadSubmissionCount || 0;
        token.installerVerified = user.installerVerified || false;
        token.quoteLimit = (user as any).quoteLimit ?? 5;
        token.sessionVersion = (user as any).sessionVersion ?? 0; // Auth Part A+B
        token.profileComplete = (user as any).profileComplete ?? false; // Auth Part A+B
      } else if ((token.quoteLimit === undefined || token.quoteLimit === null) && token.id) {
        try {
          const refreshedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              leadSubmissionLimit: true,
              sessionVersion: true, // Auth Part A+B: check for session invalidation
              profileComplete: true, // Auth Part A+B
            },
          });

          if (refreshedUser) {
            token.quoteLimit = refreshedUser.leadSubmissionLimit ?? 5;
            // Auth Part A+B: Invalidate session if version mismatch (password reset)
            if (refreshedUser.sessionVersion !== token.sessionVersion) {
              console.log('[NextAuth] Session version mismatch - forcing logout');
              return null as any; // Force logout
            }
            token.sessionVersion = refreshedUser.sessionVersion;
            token.profileComplete = refreshedUser.profileComplete;
          }
        } catch (refreshError) {
          console.error('[NextAuth] Failed to refresh user data from database:', refreshError);
          token.quoteLimit = 5;
        }
      }

      // Handle session updates (for phone number changes, verification status, etc.)
      if (trigger ==="update" && session) {
        if (session.phone !== undefined) {
          token.phone = session.phone;
        }
        if (session.phoneVerified !== undefined) {
          token.phoneVerified = session.phoneVerified;
        }
        if (session.leadSubmissionCount !== undefined) {
          token.leadSubmissionCount = session.leadSubmissionCount;
        }
      }

      // DEBUG: Print token size (only in development, never expose token contents)
      if (process.env.NODE_ENV === 'development') {
        try {
          const tokenString = JSON.stringify(token);
          console.log('[JWT DEBUG] Token size:', tokenString.length, 'bytes');
          // Security: Never log token contents, even in development
          // Token contains sensitive authentication data
        } catch (e) {
          console.log('[JWT DEBUG] Error stringifying token:', e);
        }
      }

      // CRITICAL: Always return ONLY the fields we want
      // This prevents NextAuth from accumulating garbage data
      return {
        sub: token.sub,
        id: token.id,
        role: token.role,
        email: token.email,
        name: token.name,
        image: token.image,
        phone: token.phone,
        phoneVerified: token.phoneVerified,
        leadSubmissionCount: token.leadSubmissionCount,
        installerVerified: token.installerVerified,
        quoteLimit: token.quoteLimit ?? 5,
        sessionVersion: token.sessionVersion ?? 0, // Auth Part A+B
        profileComplete: token.profileComplete ?? false, // Auth Part A+B
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
      };
    },
    async session({ session, token }) {
      // Return ONLY what the client needs
      return {
        ...session,
        user: {
          id: token.id as string,
          role: token.role as string,
          email: token.email as string,
          name: token.name as string | null,
          image: token.image as string | null,
          phone: token.phone as string | null,
          phoneVerified: token.phoneVerified as boolean,
          leadSubmissionCount: token.leadSubmissionCount as number,
          installerVerified: token.installerVerified as boolean,
          quoteLimit: (token.quoteLimit as number | undefined) ?? 5,
          profileComplete: token.profileComplete as boolean, // Auth Part A+B
        },
        expires: session.expires,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Debug mode: Can be disabled via NEXTAUTH_DEBUG=false in .env
  debug: process.env.NEXTAUTH_DEBUG === 'false' ? false : process.env.NODE_ENV === 'development',
};
