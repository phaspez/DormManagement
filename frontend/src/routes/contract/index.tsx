import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteContract,
  getContracts,
  postContract,
  putContract,
  Contract,
  BaseContract,
} from "~/fetch/contract";
import { Paginated } from "~/fetch/utils";
import { getRooms } from "~/fetch/room";
import { getStudentByID } from "~/fetch/student";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Trash2,
  Edit,
  Notebook,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "~/components/header";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";
import ContractFormDialog from "~/components/contract/ContractFormDialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { PaginationNav } from "~/components/ui/pagination-nav";

export const Route = createFileRoute("/contract/")({
  component: ContractManagement,
});

interface FormErrors {
  StudentID?: string;
  RoomID?: string;
  StartDate?: string;
  EndDate?: string;
}

export default function ContractManagement() {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch contracts with pagination
  const {
    data: contractsDataRaw,
    isLoading,
    isError,
  } = useQuery({
    queryFn: () => getContracts(page, limit),
    queryKey: ["contracts", page, limit],
  });
  // Type guard for contractsData
  const contractsData: Paginated<Contract> =
    contractsDataRaw &&
    typeof contractsDataRaw === "object" &&
    "items" in contractsDataRaw &&
    "total" in contractsDataRaw
      ? (contractsDataRaw as Paginated<Contract>)
      : { items: [], total: 0, page: 1, size: limit, pages: 0 };
  const contracts: Contract[] = contractsData.items;
  const total = contractsData.total;

  // State to store student names
  const [studentNames, setStudentNames] = useState<Record<number, string>>({});
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Fetch student names when contracts are loaded
  useEffect(() => {
    const fetchStudentNames = async () => {
      if (contracts && contracts.length > 0) {
        setIsLoadingStudents(true);
        const uniqueStudentIds = [
          ...new Set(
            (contracts as Contract[]).map(
              (contract: Contract) => contract.StudentID,
            ),
          ),
        ];

        try {
          const studentNamesMap: Record<number, string> = {};

          // Fetch each student's details and store their name
          await Promise.all(
            uniqueStudentIds.map(async (studentId: number) => {
              const student = await getStudentByID(studentId);
              if (student) {
                studentNamesMap[studentId] = student.FullName;
              }
            }),
          );

          setStudentNames(studentNamesMap);
        } catch (error) {
          console.error("Error fetching student names:", error);
        } finally {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudentNames();
  }, [contracts]);

  // Get student name by ID
  const getStudentName = (studentId: number) => {
    return studentNames[studentId] || `Loading...`;
  };

  // Mutations
  const createContractMutation = useMutation({
    mutationFn: postContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      resetForm();
    },
  });

  const updateContractMutation = useMutation({
    mutationFn: putContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      resetForm();
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<BaseContract>({
    StudentID: 0,
    RoomID: 0,
    StartDate: "",
    EndDate: "",
  });
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Date picker states
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const resetForm = () => {
    setFormData({ StudentID: 0, RoomID: 0, StartDate: "", EndDate: "" });
    setEditingContract(null);
    setErrors({});
    setIsCreateDialogOpen(false);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleCreateContract = () => {
    createContractMutation.mutate(formData);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      StudentID: contract.StudentID,
      RoomID: contract.RoomID,
      StartDate: contract.StartDate,
      EndDate: contract.EndDate,
    });

    // Set date picker states
    if (contract.StartDate) {
      setStartDate(new Date(contract.StartDate));
    }
    if (contract.EndDate) {
      setEndDate(new Date(contract.EndDate));
    }

    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateContract = () => {
    if (editingContract) {
      updateContractMutation.mutate({ ...editingContract, ...formData });
    }
  };

  const handleDeleteContract = (contractID: string) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      deleteContractMutation.mutate(contractID);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Debug: log page and limit changes
  React.useEffect(() => {
    console.log("Pagination state changed: page", page, "limit", limit);
  }, [page, limit]);

  if (isLoading) {
    return (
      <div className="w-full">
        <Header breadcrumbs={[{ name: "Invoices", url: "/invoice" }]} />
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
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
    );
  }

  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Contracts", url: "/contract" }]} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Notebook
              className="text-yellow-600 bg-yellow-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Contract Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage contracts between students and the dormitory
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ContractFormDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onSubmit={
                editingContract ? handleUpdateContract : handleCreateContract
              }
              isLoading={
                createContractMutation.isPending ||
                updateContractMutation.isPending
              }
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              //rooms={roomItems}
              editingContract={editingContract}
              resetForm={resetForm}
            />
          </div>
        </div>
      </div>

      {/* Contract List */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div />
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm text-muted-foreground"
              >
                Rows per page:
              </label>
              <Select
                value={limit.toString()}
                onValueChange={(val) => {
                  const newLimit = Number(val);
                  setLimit(newLimit);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-20 h-8" id="page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contracts found. Create your first contract to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract: Contract) => (
                    <TableRow key={contract.ContractID}>
                      <TableCell className="font-medium">
                        {contract.ContractID}
                      </TableCell>
                      <TableCell>
                        {isLoadingStudents ? (
                          <Skeleton className="h-4 w-28" />
                        ) : (
                          getStudentName(contract.StudentID)
                        )}
                      </TableCell>
                      <TableCell>{contract.RoomNumber}</TableCell>
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
                            onClick={() =>
                              handleDeleteContract(contract.ContractID)
                            }
                            disabled={deleteContractMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                          <Link
                            to={`/contract/$contractId`}
                            params={{
                              contractId: contract.ContractID.toString(),
                            }}
                          >
                            <Button variant="secondary" size="sm">
                              <Info className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Controls */}
          <div className="mt-4 flex justify-center">
            <PaginationNav
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
