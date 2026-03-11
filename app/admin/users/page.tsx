"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { User, Shield, ShieldCheck, UserCog, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/admin/users");
            setUsers(data);
        } catch (error) {
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (userId: string, newRole: string, isPending?: boolean, email?: string, name?: string) => {
        setUpdatingId(userId);
        try {
            await axios.patch("/api/admin/users", {
                userId,
                role: newRole,
                guestId: isPending ? userId.replace('pending-', '') : undefined,
                email: isPending ? email : undefined,
                name: isPending ? name : undefined
            });
            toast.success("Cargo atualizado com sucesso");
            fetchUsers();
        } catch (error) {
            toast.error("Erro ao atualizar cargo");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-olive-900/40" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-olive-900 tracking-tight">Gestão de Equipe</h1>
                <p className="text-olive-900/60 font-medium">Gerencie permissões e cargos dos usuários do sistema.</p>
            </header>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-olive-900/5 space-y-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-900/30" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou e-mail..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-olive-900/10 placeholder:text-olive-900/20 font-medium transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-hidden">
                    <table className="w-full border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-left text-olive-900/30 text-[10px] font-black uppercase tracking-widest px-4">
                                <th className="pb-2 pl-6">Usuário</th>
                                <th className="pb-2">Cargo Atual</th>
                                <th className="pb-2">Ações de Permissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="group">
                                    <td className="bg-gray-50/50 rounded-l-[1.5rem] py-4 pl-6">
                                        <div className="flex items-center gap-4">
                                            {user.image ? (
                                                <img src={user.image} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-olive-900/5 flex items-center justify-center border-2 border-white shadow-sm">
                                                    <User className="w-5 h-5 text-olive-900/20" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-olive-900">{user.name || "Sem nome"}</span>
                                                <span className="text-xs text-olive-900/40 font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="bg-gray-50/50 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                user.role === 'ADMIN' ? "bg-olive-900 text-white shadow-md shadow-olive-900/20" :
                                                    user.role === 'CO_ADMIN' ? "bg-olive-900/10 text-olive-900 border border-olive-900/10" :
                                                        "bg-gray-100 text-gray-400"
                                            )}>
                                                {user.role === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                                                {user.role}
                                            </div>
                                            {user.isPending && (
                                                <span className="text-[8px] font-bold text-olive-900/40 uppercase ml-1">Acesso Pendente</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="bg-gray-50/50 rounded-r-[1.5rem] py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role !== 'ADMIN' && (
                                                <button
                                                    onClick={() => updateRole(user.id, 'ADMIN', user.isPending, user.email, user.name)}
                                                    disabled={updatingId === user.id}
                                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-olive-900 hover:text-white transition-all disabled:opacity-50 text-olive-900/40 bg-white shadow-sm"
                                                >
                                                    Tornar Admin
                                                </button>
                                            )}
                                            {user.role !== 'CO_ADMIN' && (
                                                <button
                                                    onClick={() => updateRole(user.id, 'CO_ADMIN', user.isPending, user.email, user.name)}
                                                    disabled={updatingId === user.id}
                                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-olive-900/10 hover:text-olive-900 transition-all disabled:opacity-50 text-olive-900/40 bg-white shadow-sm border border-olive-900/5"
                                                >
                                                    Tornar Co-Admin
                                                </button>
                                            )}
                                            {!user.isPending && user.role !== 'USER' && (
                                                <button
                                                    onClick={() => updateRole(user.id, 'USER')}
                                                    disabled={updatingId === user.id}
                                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50 text-olive-900/20"
                                                >
                                                    Remover Permissões
                                                </button>
                                            )}
                                            {updatingId === user.id && <Loader2 className="w-4 h-4 animate-spin text-olive-900/40 ml-2" />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30 rounded-3xl border-2 border-dashed border-olive-900/5">
                        <div className="w-16 h-16 rounded-full bg-olive-900/5 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-olive-900/10" />
                        </div>
                        <h3 className="text-olive-900 font-black">Nenhum usuário encontrado</h3>
                        <p className="text-olive-900/40 text-sm">Tente buscar por outro termo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
