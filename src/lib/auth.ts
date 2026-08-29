import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsersBin } from "@/services/jvault.service";
import { loginSchema } from "@/schemas/auth.schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const bin = await getUsersBin();
        const user = bin.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) return null;
        if (user.isSuspended) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.avatar } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) (session.user as any).id = token.id;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
