import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatClient } from "./chat-client";

export const dynamic = "force-dynamic";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/chat");
  const sp = await searchParams;
  return (
    <div className="h-[calc(100dvh-64px)] md:h-[calc(100dvh-64px)] flex flex-col bg-[#f5f5f4] overflow-hidden">
      <ChatClient initialConversationId={sp.id || null} currentUserId={(session.user as any).id} currentUserName={session.user.name || ""} />
    </div>
  );
}
