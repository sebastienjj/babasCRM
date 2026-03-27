import { getServerSession } from "next-auth/next"
import { authOptions } from "@/feature/auth/lib/auth"

const DEV_USER_ID = "cmn6elt4i00006ta8tu4u7g9y"

export async function getSessionOrDev() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) return session

  return {
    user: {
      id: DEV_USER_ID,
      email: "josephsebastien.sj@gmail.com",
      name: "Sebastien Joseph",
    },
  }
}
