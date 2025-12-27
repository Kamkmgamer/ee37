"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, comparePassword } from "~/server/auth";
import { createSession, deleteSession } from "~/lib/session";
import { redirect } from "next/navigation";


const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  collegeId: z
    .string()
    .length(12, "College ID must be 12 digits")
    .regex(/^(2018|2019|2020)/, "College ID must start with 2018, 2019, or 2020"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or College ID is required"),
  password: z.string().min(1, "Password is required"),
});

type AuthState = {
  error?: {
    name?: string[];
    collegeId?: string[];
    email?: string[];
    password?: string[];
    identifier?: string[];
    form?: string;
  };
};

export async function signup(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const validation = signupSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors as AuthState["error"],
    };
  }

  const { name, collegeId, email, password } = validation.data;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await db.query.users.findFirst({
    where: or(eq(users.email, normalizedEmail), eq(users.collegeId, collegeId)),
  });

  if (existingUser) {
    return {
      error: {
        form: "User with this email or college ID already exists",
      },
    };
  }

  const hashedPassword = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      collegeId,
      email: normalizedEmail,
      password: hashedPassword,
    })
    .returning();

  if (!newUser) {
     return { error: { form: "Failed to create user" } };
  }

  await createSession({
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
  });

  redirect("/");
}

export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const data = Object.fromEntries(formData.entries());
  const validation = loginSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors as AuthState["error"],
    };
  }

  const { identifier, password } = validation.data;
  const normalizedIdentifier = identifier.toLowerCase();

  const user = await db.query.users.findFirst({
    where: or(
      eq(users.email, normalizedIdentifier), 
      eq(users.collegeId, identifier)
    ),
  });

  if (!user || !(await comparePassword(password, user.password))) {
    return {
      error: {
        form: "Invalid credentials",
      },
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
