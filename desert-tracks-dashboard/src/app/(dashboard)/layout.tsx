import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Providers } from "@/components/Providers"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar className="w-64 hidden xl:block" />
        <div className="flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </Providers>
  )
}
