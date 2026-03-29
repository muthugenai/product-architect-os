import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getPosts } from "@/lib/posts";

export default function AdminPage() {
  const filePosts = getPosts();
  return <AdminDashboard filePosts={filePosts} />;
}
