import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "~/components/header";
import React, { useEffect, useState } from "react";
import {
  getContractsByID,
  putContract,
  Contract,
  ContractDetails,
  BaseContract,
} from "~/fetch/contract";
import { Room } from "~/fetch/room";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  CalendarIcon,
  Edit,
  HomeIcon,
  Info,
  UserIcon,
  ArrowUpRight,
} from "lucide-react";
import ContractFormDialog from "~/components/contract/ContractFormDialog";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

// Import the FormErrors interface from ContractFormDialog
interface FormErrors {
  StudentID?: string;
  RoomID?: string;
  StartDate?: string;
  EndDate?: string;
}

export const Route = createFileRoute("/contract/$contractId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { contractId } = Route.useParams();
  const [contract, setContract] = useState<ContractDetails | null>(null);
  const [rooms, _setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state - using FormErrors interface instead of Record<string, string>
  const [formData, setFormData] = useState<BaseContract>({
    StudentID: 0,
    RoomID: 0,
    StartDate: "",
    EndDate: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    getContractsByID(contractId).then(setContract).catch(console.error);
    //getRooms().then(setRooms).catch(console.error);
  }, [contractId]);

  useEffect(() => {
    if (contract) {
      setFormData({
        StudentID: contract.StudentID,
        RoomID: contract.RoomID,
        StartDate: contract.StartDate,
        EndDate: contract.EndDate,
      });

      if (contract.StartDate) {
        setStartDate(parseISO(contract.StartDate));
      }

      if (contract.EndDate) {
        setEndDate(parseISO(contract.EndDate));
      }
    }
  }, [contract]);

  const resetForm = () => {
    if (contract) {
      setFormData({
        StudentID: contract.StudentID,
        RoomID: contract.RoomID,
        StartDate: contract.StartDate,
        EndDate: contract.EndDate,
      });

      if (contract.StartDate) {
        setStartDate(parseISO(contract.StartDate));
      }

      if (contract.EndDate) {
        setEndDate(parseISO(contract.EndDate));
      }
    }

    setIsDialogOpen(false);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.StudentID) {
      newErrors.StudentID = "Student ID is required";
    }

    if (!formData.RoomID) {
      newErrors.RoomID = "Room is required";
    }

    if (!formData.StartDate) {
      newErrors.StartDate = "Start date is required";
    }

    if (!formData.EndDate) {
      newErrors.EndDate = "End date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updatedContract = await putContract({
        ...formData,
        ContractID: contractId,
      });

      toast.success("Contract updated successfully");
      setContract(await getContractsByID(contractId));
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update contract");
      console.error("Error updating contract:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "PPP");
    } catch (error) {
      return dateStr;
    }
  };

  if (!contract) {
    return (
      <div className="w-full">
        <Header
          breadcrumbs={[
            { name: "Contracts", url: "/contract" },
            {
              name: `Contract ${contractId}`,
              url: `/contract/${contractId}`,
            },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">
            Loading contract details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header
        breadcrumbs={[
          { name: "Contracts", url: "/contract" },
          {
            name: `Contract ${contractId}`,
            url: `/contract/${contractId}`,
          },
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contract Details</h1>
        <ContractFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          rooms={rooms}
          editingContract={contract as Contract}
          resetForm={resetForm}
          triggerButton={
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Contract
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Information
            </CardTitle>
            <CardDescription>
              Details of the student associated with this contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 px-2 grid gap-4">
              <div className="flex w-full items-center gap-2">
                <UserIcon className="h-5 w-5" />
                <div className="flex grow gap-2 justify-between items-center">
                  <h5 className="text-md font-bold">{contract.StudentName}</h5>
                  <p className="text-sm">ID: {contract.StudentID}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5" />
                <div className="flex grow gap-2 justify-between items-center">
                  <h5 className="text-md font-bold">
                    Room {contract.RoomNumber}
                  </h5>
                  <span className="flex items-center gap-2">
                    <p className="text-sm">
                      ID: {contract.RoomID}, Type: {contract.RoomTypeName}
                    </p>
                    <Link
                      to="/room/$roomId"
                      params={{ roomId: contract.RoomID.toString() }}
                    >
                      <Button>
                        <ArrowUpRight />
                      </Button>
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Contract Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Start Date</p>
                <Badge variant="outline" className="text-sm py-1.5">
                  {formatDate(contract.StartDate)}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">End Date</p>
                <Badge variant="outline" className="text-sm py-1.5">
                  {formatDate(contract.EndDate)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Service Usages</CardTitle>
            <CardDescription>
              Services included in this contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contract.ServiceUsages && contract.ServiceUsages.length > 0 ? (
              <div className="space-y-4">
                {contract.ServiceUsages.map((service, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 items-center justify-between">
                        <h5 className="text-lg font-bold">
                          {service.ServiceName} x{service.Quantity}
                        </h5>
                        <span>ID: {service.ServiceID}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {service.UsageMonth}/{service.UsageYear}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No service usages found for this contract.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
