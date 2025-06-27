import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { CreditCard } from "lucide-react"
import AddBankAccount from "./AddBankAccount"
import BankAccountList from "./BankAccountList"

const BankAccounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="list">My Accounts</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <BankAccountList />
          </TabsContent>

          <TabsContent value="add">
            <AddBankAccount />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default BankAccounts

