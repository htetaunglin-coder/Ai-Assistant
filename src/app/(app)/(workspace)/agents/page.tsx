import { authServerAPI } from "@/lib/auth/server"
import { RefreshAccessToken } from "@/components/refresh-access-token"

const Page = async () => {
  const session = await authServerAPI.validateTokenCached()

  if (!session) {
    return <RefreshAccessToken />
  }

  return <>Under development</>
}

export default Page
