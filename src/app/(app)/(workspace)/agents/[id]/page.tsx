import React from "react"
import { authServerAPI } from "@/lib/auth/server"
import { WorkspaceLayoutMainContainer } from "@/components/layout/workspace/workspace"
import { RefreshAccessToken } from "@/components/refresh-access-token"

const AgentsDetail = async () => {
  const session = await authServerAPI.validateTokenCached()

  if (!session) {
    return <RefreshAccessToken />
  }

  return (
    <WorkspaceLayoutMainContainer>
      <div className="flex size-full items-center justify-center p-4">
        <div className="-mt-24">
          <h1 className="text-5xl font-bold">WIP</h1>
        </div>
      </div>
    </WorkspaceLayoutMainContainer>
  )
}

export default AgentsDetail
