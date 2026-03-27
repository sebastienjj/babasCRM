import {prisma} from "@/libs/prisma";
import {NextRequest, NextResponse} from "next/server";
import {getSessionOrDev} from "@/libs/devSession";


export async function GET(req: NextRequest) {
    try {
        const session = await getSessionOrDev();
        if (!session?.user?.id) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        let user;
        const action = req.nextUrl.searchParams.get('action');
        const value = req.nextUrl.searchParams.get('value');
        if(!action || !value) {
            return NextResponse.json({error: "Bad Request"}, {status: 400});
        }
        if (action == 'searchById') {
            user = await prisma.user.findUnique({
                where: {id: value}
            })
        } else if (action == 'searchByName') {
            user = await prisma.user.findFirst({
                where: {name: value}
            })
        }
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