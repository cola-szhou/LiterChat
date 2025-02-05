// import NextAuth, { getServerSession } from "next-auth";
// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { getUser } from "@/lib/db/queries";
// import { compare } from "bcrypt-ts";
// import { headers } from "next/headers";

// export const authOptions: NextAuthOptions = {
//   secret: process.env.NEXTAUTH_SECRET,
//   session: {
//     strategy: "jwt",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text", placeholder: "abc@example.com" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             throw new Error("Please enter your email and password.");
//           }

//           const users = await getUser(credentials.email);
//           // const users = await db
//           //   .select()
//           //   .from(user)
//           //   .where(eq(user.email, credentials.email));

//           if (users.length === 0) {
//             throw new Error("No user found");
//           }

//           const isValidPassword = await compare(
//             credentials.password,
//             users[0].password
//           );
//           if (!isValidPassword) {
//             throw new Error("Invalid password");
//           }
//           return {
//             id: users[0].id.toString(),
//             email: users[0].email,
//           };
//         } catch (error) {
//           console.error("Authorization failed:", error);
//           throw new Error(error.message || "Unknown error");
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           email: token.email,
//         };
//       }
//       return session;
//     },
//   },
// };

// export const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import { authOptions } from "@/app/(auth)/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
