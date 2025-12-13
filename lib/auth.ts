import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();

        let user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        // If user doesn't exist, create a new user (auto-registration on first sign-in)
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          // Extract name from email (part before @) or use email
          const name = credentials.email.split("@")[0];

          user = await User.create({
            email: credentials.email,
            name: name,
            password: hashedPassword,
            provider: "credentials",
          });

          return {
            id: (user._id as any).toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }

        if (!user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();

        // Check if user exists
        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Ensure we have valid email and name
          if (!user.email) {
            return false; // Reject sign-in if no email
          }

          const userName =
            user.name || profile?.name || user.email.split("@")[0];

          // Create new user with Google OAuth
          existingUser = await User.create({
            email: user.email,
            name: userName,
            image: user.image || undefined,
            provider: "google",
            googleId: account.providerAccountId,
          });
        } else if (!existingUser.googleId && account.providerAccountId) {
          // Link Google account to existing user
          existingUser.googleId = account.providerAccountId;
          existingUser.provider = "google";
          existingUser.image = user.image || undefined;
          await existingUser.save();
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      // Fetch user data from database to get MongoDB _id
      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = (dbUser._id as any).toString();
          token.image = dbUser.image;
        }
      }

      // For credentials provider, set id from user object on first sign in
      if (user && !token.id) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).image = token.image || session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
