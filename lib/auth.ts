import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function auth() {
    return getServerSession(authOptions)
}

import { compare } from "bcryptjs"

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
}

export { authOptions }
