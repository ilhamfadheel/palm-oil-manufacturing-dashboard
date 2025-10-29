import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TeamSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <span className="font-medium">Palm Oil Co.</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]" align="end" forceMount>
        <DropdownMenuItem className="cursor-pointer">
          <span>Palm Oil Co.</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <span>Refinery A</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <span>Farm Network</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <span>Logistics Team</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
