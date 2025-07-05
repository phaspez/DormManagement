import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteContract, getContracts, postContract, putContract, Contract } from "~/fetch/contract"
import { getRooms, Room } from "~/fetch/room"
import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Separator } from "~/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar } from "~/components/ui/calendar"
import { Trash2, Edit, Plus, X, FileText, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "~/lib/utils"
import Header from "~/components/header";

export const Route = createFileRoute("/contract")({
    component: ContractManagement,
})

interface FormErrors {
    StudentID?: string
    RoomID?: string
    StartDate?: string
    EndDate?: string
}

export default function ContractManagement() {
    const queryClient = useQueryClient()

    // Fetch contracts
    const { data: contracts, isLoading, isError } = useQuery({
        queryFn: getContracts,
        queryKey: ["contracts"]
    })

    // Fetch rooms for dropdown selection
    const { data: rooms, isLoading: isLoadingRooms } = useQuery({
        queryFn: getRooms,
        queryKey: ["rooms"]
    });

    // Mutations
    const createContractMutation = useMutation({
        mutationFn: postContract,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] })
            resetForm()
        },
    })

    const updateContractMutation = useMutation({
        mutationFn: putContract,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] })
            resetForm()
        },
    })

    const deleteContractMutation = useMutation({
        mutationFn: deleteContract,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
    })

    // State for form inputs
    const [formData, setFormData] = useState<Omit<Contract, "ContractID">>({
        StudentID: 0,
        RoomID: 0,
        StartDate: "",
        EndDate: "",
    })
    const [editingContract, setEditingContract] = useState<Contract | null>(null)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    // Date picker states
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)

    // Find room number by ID
    const getRoomNumber = (roomId: number) => {
        const room = rooms?.find(r => r.RoomID === roomId);
        return room ? room.RoomNumber : `Unknown`;
    };

    // Validation function
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.StudentID || formData.StudentID <= 0) {
            newErrors.StudentID = "Student ID is required and must be positive"
        }

        if (!formData.RoomID || formData.RoomID <= 0) {
            newErrors.RoomID = "Please select a room"
        }

        if (!formData.StartDate) {
            newErrors.StartDate = "Start date is required"
        }

        if (!formData.EndDate) {
            newErrors.EndDate = "End date is required"
        } else if (formData.EndDate < formData.StartDate) {
            newErrors.EndDate = "End date must be after start date"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handlers
    const handleInputChange = (name: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }))
        }
    }

    const handleDateChange = (field: 'StartDate' | 'EndDate', date: Date | undefined) => {
        if (date) {
            const formattedDate = format(date, 'yyyy-MM-dd')
            setFormData(prev => ({
                ...prev,
                [field]: formattedDate
            }))

            if (field === 'StartDate') {
                setStartDate(date)
            } else {
                setEndDate(date)
            }
        }

        // Clear error when user selects a date
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }
    }

    const resetForm = () => {
        setFormData({ StudentID: 0, RoomID: 0, StartDate: "", EndDate: "" })
        setEditingContract(null)
        setErrors({})
        setIsCreateDialogOpen(false)
        setStartDate(undefined)
        setEndDate(undefined)
    }

    const handleCreateContract = () => {
        if (!validateForm()) return
        createContractMutation.mutate(formData)
    }

    const handleEditContract = (contract: Contract) => {
        setEditingContract(contract)
        setFormData({
            StudentID: contract.StudentID,
            RoomID: contract.RoomID,
            StartDate: contract.StartDate,
            EndDate: contract.EndDate,
        })
        setErrors({})
        setIsCreateDialogOpen(true)

        // Set date picker states
        if (contract.StartDate) {
            setStartDate(new Date(contract.StartDate))
        }
        if (contract.EndDate) {
            setEndDate(new Date(contract.EndDate))
        }
    }

    const handleUpdateContract = () => {
        if (!validateForm()) return
        if (editingContract) {
            updateContractMutation.mutate({ ...editingContract, ...formData })
        }
    }

    const handleDeleteContract = (contractID: string) => {
        if (window.confirm("Are you sure you want to delete this contract?")) {
            deleteContractMutation.mutate(contractID)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    }

    if (isLoading || isLoadingRooms) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg">Loading contracts...</div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="container mx-auto p-4">
                <Alert className="max-w-md mx-auto">
                    <AlertDescription>
                        Error loading contracts. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="w-full">
            <Header breadcrumbs={[
                {"name": "Contracts", "url": "/contract"}
            ]}/>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contract Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage student housing contracts and room assignments
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                        setEditingContract(null)
                                        setFormData({ StudentID: 0, RoomID: 0, StartDate: "", EndDate: "" })
                                        setErrors({})
                                        setStartDate(undefined)
                                        setEndDate(undefined)
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Create New Contract
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        {editingContract ? <Edit className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        {editingContract ? "Edit Contract" : "Create New Contract"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="studentId">Student ID</Label>
                                            <Input
                                                id="studentId"
                                                type="number"
                                                placeholder="Enter student ID"
                                                value={formData.StudentID || ""}
                                                onChange={(e) => handleInputChange("StudentID", parseInt(e.target.value) || 0)}
                                                className={errors.StudentID ? "border-destructive" : ""}
                                            />
                                            {errors.StudentID && (
                                                <p className="text-sm text-destructive">{errors.StudentID}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="roomId">Room</Label>
                                            <Select
                                                value={formData.RoomID > 0 ? formData.RoomID.toString() : ""}
                                                onValueChange={(value) => handleInputChange("RoomID", parseInt(value))}
                                            >
                                                <SelectTrigger className={errors.RoomID ? "border-destructive" : ""}>
                                                    <SelectValue placeholder="Select room" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {rooms?.map((room) => (
                                                        <SelectItem
                                                            key={room.RoomID}
                                                            value={room.RoomID.toString()}
                                                        >
                                                            {room.RoomNumber}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.RoomID && (
                                                <p className="text-sm text-destructive">{errors.RoomID}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !startDate && "text-muted-foreground",
                                                            errors.StartDate && "border-destructive"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown"
                                                        fromYear={new Date().getFullYear() - 5}
                                                        toYear={new Date().getFullYear() + 5}
                                                        selected={startDate}
                                                        onSelect={(date) => handleDateChange('StartDate', date)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.StartDate && (
                                                <p className="text-sm text-destructive">{errors.StartDate}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !endDate && "text-muted-foreground",
                                                            errors.EndDate && "border-destructive"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        captionLayout="dropdown"
                                                        fromYear={new Date().getFullYear() - 5}
                                                        toYear={new Date().getFullYear() + 5}
                                                        selected={endDate}
                                                        onSelect={(date) => handleDateChange('EndDate', date)}
                                                        initialFocus
                                                        disabled={(date) => startDate ? date < startDate : false}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.EndDate && (
                                                <p className="text-sm text-destructive">{errors.EndDate}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={editingContract ? handleUpdateContract : handleCreateContract}
                                            disabled={createContractMutation.isPending || updateContractMutation.isPending}
                                            className="flex-1"
                                        >
                                            {editingContract ? "Update Contract" : "Create Contract"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={resetForm}
                                            className="flex items-center gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Contract List */}
            <Card>
                <CardHeader>
                    <CardTitle>Contracts ({contracts?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {contracts?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No contracts found. Create your first contract to get started.
                        </div>
                    ) : (
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract ID</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Room Number</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contracts?.map((contract) => (
                                        <TableRow key={contract.ContractID}>
                                            <TableCell className="font-medium">{contract.ContractID}</TableCell>
                                            <TableCell>{contract.StudentID}</TableCell>
                                            <TableCell>{getRoomNumber(contract.RoomID)}</TableCell>
                                            <TableCell>{formatDate(contract.StartDate)}</TableCell>
                                            <TableCell>{formatDate(contract.EndDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditContract(contract)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteContract(contract.ContractID)}
                                                        disabled={deleteContractMutation.isPending}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}