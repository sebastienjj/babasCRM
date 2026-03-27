import {NextRequest, NextResponse} from "next/server";
import {getSessionOrDev} from "@/libs/devSession";
import {prisma} from "@/libs/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Params) {
    try {
        const session = await getSessionOrDev();
        if (!session?.user?.id) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const {id} = await context.params;
        const user = await prisma.user.findUnique({
            where: {id: id}
        })
        if (!user) {
            return NextResponse.json({error: "User not found"}, {status: 404});
        } else {
            user.password = ""; // Remove password before sending response
        }
        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}