import Link from "next/link"
import { notFound } from "next/navigation"
import { agentsServerAPI } from "@/features/agents/api/server"
import { AgentDetailsForm } from "@/features/agents/components/agent-detail"
import { AgentIcon, AgentIconName } from "@/features/agents/components/agent-icon"
import { Button } from "@mijn-ui/react"
import { ArrowRight } from "lucide-react"
import { authServerAPI } from "@/lib/auth/server"
import { WorkspaceLayoutMainContainer } from "@/components/layout/workspace/workspace"
import { RefreshAccessToken } from "@/components/refresh-access-token"

const AgentDetail = async (props: { params: Promise<{ id: string }> }) => {
  const session = await authServerAPI.validateTokenCached()

  if (!session) {
    return <RefreshAccessToken />
  }

  const params = await props.params
  const id = params?.id

  const apiResponse = await agentsServerAPI.getAgentDetail(id)

  if (!apiResponse) return notFound()

  const agentDetail = apiResponse.data

  return (
    <WorkspaceLayoutMainContainer>
      <div className="size-full overflow-y-auto py-16">
        <div className="mx-auto w-full max-w-2xl space-y-6 px-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AgentIcon icon={agentDetail.icon as AgentIconName} className="text-sm sm:text-base" />
              <h3 className="text-base font-medium sm:text-xl">{agentDetail.name}</h3>
            </div>
            <Button asChild className="shrink-0 gap-2" variant="primary">
              <Link href={`/chat?agent=${agentDetail.id}`}>
                Chat With Agent <ArrowRight />
              </Link>
            </Button>
          </div>

          <AgentDetailsForm {...agentDetail} />
        </div>
      </div>
    </WorkspaceLayoutMainContainer>
  )
}

export default AgentDetail
