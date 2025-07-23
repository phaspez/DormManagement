import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Trash2, Edit, Plus, X, User, Download } from "lucide-react";
import Header from "~/components/header";
import {
  deleteStudent,
  exportStudentsExcel,
  getStudents,
  postStudent,
  putStudent,
  Students,
} from "~/fetch/student";
import { Skeleton } from "~/components/ui/skeleton";
import TableSkeleton from "~/components/TableSkeleton";
import { PaginationNav } from "~/components/ui/pagination-nav";
import { Paginated } from "~/fetch/utils";
import { exportContractsExcel } from "~/fetch/contract";

export const Route = createFileRoute("/student")({
  component: StudentManagement,
});

interface FormErrors {
  FullName?: string;
  Gender?: string;
  PhoneNumber?: string;
}

export default function StudentManagement() {
  const queryClient = useQueryClient();

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch students with pagination
  const {
    data: studentsDataRaw,
    isLoading,
    isError,
  } = useQuery({
    queryFn: () => getStudents(page, limit),
    queryKey: ["students", page, limit],
  });

  // Type guard for studentsData
  const studentsData: Paginated<Students> =
    studentsDataRaw &&
    typeof studentsDataRaw === "object" &&
    "items" in studentsDataRaw &&
    "total" in studentsDataRaw
      ? (studentsDataRaw as Paginated<Students>)
      : { items: [], total: 0, page: 1, size: limit, pages: 0 };

  const students: Students[] = studentsData.items;
  const total = studentsData.total;

  // Mutations
  const createStudentMutation = useMutation({
    mutationFn: postStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      resetForm();
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: putStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      resetForm();
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students"] }),
  });

  // State for form inputs
  const [formData, setFormData] = useState<Omit<Students, "StudentID">>({
    FullName: "",
    Gender: "",
    PhoneNumber: "",
  });
  const [editingStudent, setEditingStudent] = useState<Students | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.FullName.trim()) {
      newErrors.FullName = "Full name is required";
    } else if (formData.FullName.length < 3) {
      newErrors.FullName = "Full name must be at least 3 characters";
    }

    if (!formData.Gender.trim()) {
      newErrors.Gender = "Gender is required";
    }

    if (!formData.PhoneNumber.trim()) {
      newErrors.PhoneNumber = "Phone number is required";
    } else if (!/^\d{10,12}$/.test(formData.PhoneNumber)) {
      newErrors.PhoneNumber = "Phone number must be between 10-12 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const resetForm = () => {
    setFormData({ FullName: "", Gender: "", PhoneNumber: "" });
    setEditingStudent(null);
    setErrors({});
    setIsCreateDialogOpen(false);
  };

  const handleCreateStudent = () => {
    if (!validateForm()) return;
    createStudentMutation.mutate(formData);
  };

  const handleEditStudent = (student: Students) => {
    setEditingStudent(student);
    setFormData({
      FullName: student.FullName,
      Gender: student.Gender,
      PhoneNumber: student.PhoneNumber,
    });
    setErrors({});
    setIsCreateDialogOpen(true);
  };

  const handleUpdateStudent = () => {
    if (!validateForm()) return;
    if (editingStudent) {
      updateStudentMutation.mutate({ ...editingStudent, ...formData });
    }
  };

  const handleDeleteStudent = (studentID: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentID);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Header breadcrumbs={[{ name: "Students", url: "/student" }]} />
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
            Error loading students. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header breadcrumbs={[{ name: "Students", url: "/student" }]} />
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User
              className="text-green-600 bg-green-100 rounded-lg p-1"
              size={36}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Student Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage student records, assignments, and information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    setEditingStudent(null);
                    setFormData({ FullName: "", Gender: "", PhoneNumber: "" });
                    setErrors({});
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {editingStudent ? (
                      <Edit className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.FullName}
                      onChange={(e) =>
                        handleInputChange("FullName", e.target.value)
                      }
                      className={errors.FullName ? "border-destructive" : ""}
                    />
                    {errors.FullName && (
                      <p className="text-sm text-destructive">
                        {errors.FullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.Gender}
                      onValueChange={(value) =>
                        handleInputChange("Gender", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.Gender ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.Gender && (
                      <p className="text-sm text-destructive">
                        {errors.Gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="text"
                      placeholder="Enter phone number"
                      value={formData.PhoneNumber}
                      onChange={(e) =>
                        handleInputChange("PhoneNumber", e.target.value)
                      }
                      className={errors.PhoneNumber ? "border-destructive" : ""}
                    />
                    {errors.PhoneNumber && (
                      <p className="text-sm text-destructive">
                        {errors.PhoneNumber}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      onClick={
                        editingStudent
                          ? handleUpdateStudent
                          : handleCreateStudent
                      }
                      disabled={
                        createStudentMutation.isPending ||
                        updateStudentMutation.isPending
                      }
                      className="flex-1"
                    >
                      {editingStudent ? "Update Student" : "Add Student"}
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
            <Button onClick={exportStudentsExcel}>
              <Download />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({total})</CardTitle>
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
          {students?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found. Add your first student to get started.
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students?.map((student) => (
                    <TableRow key={student.StudentID}>
                      <TableCell className="font-medium">
                        {student.StudentID}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.FullName}
                      </TableCell>
                      <TableCell>{student.Gender}</TableCell>
                      <TableCell>{student.PhoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDeleteStudent(student.StudentID)
                            }
                            disabled={deleteStudentMutation.isPending}
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
