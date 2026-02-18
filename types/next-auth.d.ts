import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: string
            tier: string
        }
    }

    interface User {
        id: string
        role: string
        email: string
        name: string
        tier: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}
