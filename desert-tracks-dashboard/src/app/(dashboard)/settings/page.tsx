"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Shield, Globe, Bell, FileDown, UserPlus, Key, Trash2 } from "lucide-react"

export default function SettingsPage() {
    // Simulated auth state for demonstration
    const [isAdmin] = useState(true);

    const [agents, setAgents] = useState([
        { id: 1, email: "jaun@desert-tracks.com", role: "Administrator", added: "2025-01-10" },
        { id: 2, email: "sarah@desert-tracks.com", role: "Reservations Manager", added: "2025-02-14" },
        { id: 3, email: "agent1@safari.com", role: "Booking Agent", added: "2026-01-01" },
    ]);

    const handleDeleteAgent = (id: number) => {
        setAgents(prev => prev.filter(agent => agent.id !== id));
    };

    return (
        <div className="max-w-[1600px] mx-auto min-h-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-0 -mt-2 lg:-mt-10 mb-12">
                <h1 className="text-4xl font-serif text-foreground mb-3 tracking-tight flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full hidden md:block">
                        <Settings className="h-8 w-8 text-primary" />
                    </div>
                    System Preferences
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">Manage your dashboard configuration, connection endpoints, and scrape engine telemetry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Developer Toggles */}
                <div className="space-y-6">
                    <h3 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Core Routing
                    </h3>
                    <Card className="bg-card/60 shadow-sm border-border rounded-[16px] overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 mr-4">
                                    <Label className="text-base font-serif font-medium">Remote Replit Connection</Label>
                                    <p className="text-xs text-muted-foreground">Force search queries to hit `spock.replit.dev` instead of localhost for production headless scraping.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="h-px bg-border/50 w-full" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 mr-4">
                                    <Label className="text-base font-serif font-medium">Nightsbridge API Fallback</Label>
                                    <p className="text-xs text-muted-foreground">Automatically fallback to standard HTTP scraping if Nightsbridge XML bridge experiences rate-limiting.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="h-px bg-border/50 w-full" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 mr-4">
                                    <Label className="text-base font-serif font-medium">Bypass Regional Cache</Label>
                                    <p className="text-xs text-muted-foreground text-orange-600 font-medium">Bypassing cache will result in significantly slower availability search returns due to fresh puppeteer boots.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications & System */}
                <div className="space-y-6">
                    <h3 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" /> External Systems
                    </h3>
                    <Card className="bg-card/60 shadow-sm border-border rounded-[16px] overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 flex items-center gap-3">
                                    <div className="bg-muted p-2 rounded-[6px] shrink-0">
                                        <Bell className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <Label className="text-base font-serif font-medium">Slack Crash Reporting</Label>
                                        <p className="text-xs text-muted-foreground">Send an immediate webhook to `#dev-errors` if Vercel backend encounters a socket hangup.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="h-px bg-border/50 w-full" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 flex items-center gap-3">
                                    <div className="bg-muted p-2 rounded-[6px] shrink-0">
                                        <FileDown className="h-4 w-4 text-foreground" />
                                    </div>
                                    <div>
                                        <Label className="text-base font-serif font-medium">AI Extraction Audits</Label>
                                        <p className="text-xs text-muted-foreground">Archive the raw JSON payloads returned by GPT-4o Vision during Contract Rate upload parses.</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>

            {/* Admin Only Section */}
            {isAdmin && (
                <div className="mt-8 lg:mt-12 space-y-6 max-w-2xl">
                    <h3 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Key className="h-4 w-4 text-orange-600" /> Admin Area: User Management
                    </h3>
                    <Card className="bg-card/60 shadow-sm border-orange-600/20 rounded-[16px] overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                            <p className="text-sm text-muted-foreground mb-4">Create access credentials for agents and external consultants. Passwords are encrypted instantly.</p>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-user">Email Address</Label>
                                    <Input id="new-user" type="email" placeholder="agent@desert-tracks.com" className="bg-background" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-pass">Secure Password</Label>
                                    <Input id="new-pass" type="password" placeholder="••••••••" className="bg-background" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-pass-repeat">Repeat Password</Label>
                                    <Input id="new-pass-repeat" type="password" placeholder="••••••••" className="bg-background" />
                                </div>

                                <div className="space-y-2 lg:col-span-2">
                                    <Label>System Role</Label>
                                    <Select defaultValue="agent">
                                        <SelectTrigger className="w-full bg-background">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="manager">Reservations Manager</SelectItem>
                                            <SelectItem value="agent">Booking Agent (Read Only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button className="w-full mt-2 font-serif bg-foreground text-background hover:bg-foreground/90">
                                <UserPlus className="h-4 w-4 mr-2" /> Add System User
                            </Button>
                        </CardContent>
                    </Card>

                    <h4 className="text-sm font-sans font-semibold text-foreground mt-8 mb-4">Allocated System Users</h4>
                    <Card className="bg-card shadow-sm border-border rounded-[16px] overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email / Username</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Added</th>
                                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {agents.map((agent) => (
                                    <tr key={agent.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{agent.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.role === 'Administrator' ? 'bg-orange-600/10 text-orange-600' :
                                                agent.role === 'Reservations Manager' ? 'bg-blue-600/10 text-blue-600' :
                                                    'bg-primary/10 text-primary'
                                                }`}>
                                                {agent.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground">{agent.added}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDeleteAgent(agent.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                </div>
            )}

        </div>
    )
}
