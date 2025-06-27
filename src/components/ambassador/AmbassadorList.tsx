import type React from "react"
import type { Ambassador } from "../../types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatDate } from "../../lib/utils"

interface AmbassadorListProps {
  ambassadors: Ambassador[]
  onEdit: (ambassador: Ambassador) => void
  onDelete: (ambassadorId: string) => void
  onView: (ambassador: Ambassador) => void
}

const AmbassadorList: React.FC<AmbassadorListProps> = ({ ambassadors, onEdit, onDelete, onView }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ambassadors</h2>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Telegram Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ambassadors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No ambassadors found
                </TableCell>
              </TableRow>
            ) : (
              ambassadors.map((ambassador) => (
                <TableRow key={ambassador.id}>
                  <TableCell>
                    <img
                      src={ambassador.photoUrl || "/placeholder.svg"}
                      alt={ambassador.firstName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{ambassador.firstName + ' '+ ambassador.lastName}</TableCell>
                  <TableCell>{ambassador.tgUsername}</TableCell>
                  <TableCell>{ambassador.email}</TableCell>
                  <TableCell>{ambassador.phone}</TableCell>
                  <TableCell>{ambassador.country}</TableCell>
                  <TableCell>{formatDate(ambassador.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onView(ambassador)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(ambassador)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => onDelete(ambassador.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default AmbassadorList

