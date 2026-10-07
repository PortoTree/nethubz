import { getProjectsByUsername } from "@/app/actions/projects";
import ClientUserProjectPage from "./ClientUserProjectPage";
import { notFound } from "next/navigation";

export default async function UserProjectPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { username, locale } = await params;
  const decodedUsername = decodeURIComponent(username);
  
  const { success, projects, user } = await getProjectsByUsername(decodedUsername);

  console.log("GET PROJECTS RES:", {success, user: !!user, projectCount: projects?.length});
  if (!success || !user) {
    notFound();
  }

  return (
    <ClientUserProjectPage 
      username={decodedUsername}
      locale={locale} 
      initialProjects={projects || []} 
      initialProfileUser={user} 
    />
  );
}
