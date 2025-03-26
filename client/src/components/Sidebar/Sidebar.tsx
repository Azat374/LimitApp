import {
    Home,
    LineChart,
    FileUp
} from "lucide-react"

const Sidebar = () => {
  return (
      <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                  <a href="/" className="flex items-center gap-2 font-semibold">
                      <span className="">LimitApp</span>
                  </a>

              </div>
              <div className="flex-1">
                  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                      <a
                          href="/home"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                          <Home className="h-4 w-4" />
                          Home
                      </a>
                      <a
                          href="/tasks"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                          <LineChart className="h-4 w-4" />
                          Tasks
                      </a>

                      <a
                          href="/report"
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                      >
                          <FileUp className="h-4 w-4" />
                          Report
                      </a>
                  </nav>
              </div>
          </div>
      </div>
  )
}

export default Sidebar