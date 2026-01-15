import prisma from "@/lib/prisma"

export default async function AdminDashboard() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: "desc" },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <a
          href="/admin/projects/new"
          className="bg-black text-white px-4 py-2"
        >
          New Project
        </a>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Title</th>
            <th>Progress</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.title}</td>
              <td className="text-center">{p.progress}</td>
              <td className="text-right p-2">
                <a
                  href={`/admin/portal/projects/${p.id}`}
                  className="underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
