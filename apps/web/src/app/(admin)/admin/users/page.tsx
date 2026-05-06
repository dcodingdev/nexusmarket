"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  MoreVertical,
  UserCheck,
  UserX
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";

async function fetchUsers(token: string | null, search = "") {
  if (!token) return null;
  const url = search 
    ? `http://localhost:8000/api/v1/users?search=${search}` 
    : `http://localhost:8000/api/v1/users`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function toggleSuspension(userId: string, token: string | null) {
  if (!token) throw new Error("Unauthorized");
  const res = await fetch(`http://localhost:8000/api/v1/users/${userId}/suspend`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to toggle suspension");
  return res.json();
}

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const { accessToken } = useAuthStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, accessToken],
    queryFn: () => fetchUsers(accessToken, search),
    enabled: !!accessToken,
  });

  const mutation = useMutation({
    mutationFn: (userId: string) => toggleSuspension(userId, accessToken),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const users = data?.data || [];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage accounts and moderate platform access.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">User</th>
                  <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading platform users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td></tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] tracking-wider",
                          user.role === "ADMIN" && "bg-red-50 text-red-600 border-red-200",
                          user.role === "VENDOR" && "bg-blue-50 text-blue-600 border-blue-200"
                        )}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.isSuspended ? (
                          <Badge className="bg-red-500 text-[10px] tracking-wider">Suspended</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-[10px] tracking-wider">Active</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 gap-2",
                            user.isSuspended ? "text-green-600" : "text-red-600"
                          )}
                          onClick={() => mutation.mutate(user._id)}
                        >
                          {user.isSuspended ? (
                            <><UserCheck className="w-4 h-4" /> Unsuspend</>
                          ) : (
                            <><UserX className="w-4 h-4" /> Suspend</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
