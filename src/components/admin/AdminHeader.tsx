import { usePathname } from 'next/navigation'
import { Breadcrumbs, BreadcrumbItem, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react'
import { User, LogOut, Settings } from 'lucide-react'

export function AdminHeader() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <Breadcrumbs>
          <BreadcrumbItem>Admin</BreadcrumbItem>
          {paths.slice(1).map((path) => (
            <BreadcrumbItem key={`path-${path}`}>
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>

        <Dropdown>
          <DropdownTrigger>
            <Avatar
              className="cursor-pointer"
              size="sm"
              src="https://i.pravatar.cc/150"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User actions">
            <DropdownItem key="profile" startContent={<User size={16} />}>
              Profile
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Settings size={16} />}>
              Settings
            </DropdownItem>
            <DropdownItem 
              key="logout" 
              className="text-danger" 
              color="danger"
              startContent={<LogOut size={16} />}
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
} 