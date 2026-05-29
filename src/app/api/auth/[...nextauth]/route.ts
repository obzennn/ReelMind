import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Guest Mode (Mock)",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "guest" },
      },
      async authorize(credentials) {
        if (credentials?.username) {
          return { id: "1", name: credentials.username, email: `${credentials.username}@example.com` };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
