'use server'
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export const onAuthenticateUser = async () => {
    try {
        const user = await currentUser()
        if (!user) {
            return { status: 403 , message: "User not authenticated" }
        }
        // console.log("Authenticated user:", user)

        const userExist = await prisma.user.findUnique({
            where: { clerkId: user.id },
        })

        if (userExist) {
            return { status: 200, user: userExist }
        }

        const newUser = await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: user.firstName + ' ' + user.lastName,
                profileImage: user.imageUrl,
            }
        })

        if (newUser) {
            return { status: 201, user: newUser }
        }
        return { status: 400, message: "User creation failed" }

    } catch (error) {
        console.error("Error fetching current user:", error)
        return { status: 500, message: "Internal server error" }
    }
}