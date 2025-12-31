"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  GraduationCap,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Search,
} from "lucide-react";

export default function AdminLearningPage() {
  const [activeTab, setActiveTab] = useState<"subjects" | "materials">(
    "materials",
  );
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");

  const { data: subjects, refetch: refetchSubjects } =
    api.admin.learning.listSubjects.useQuery();
  const { data: materialsData, refetch: refetchMaterials } =
    api.admin.learning.listMaterials.useQuery({
      status: statusFilter === "all" ? undefined : statusFilter,
      limit: 50,
    });

  const approveMutation = api.admin.learning.approveMaterial.useMutation({
    onSuccess: () => refetchMaterials(),
  });

  const rejectMutation = api.admin.learning.rejectMaterial.useMutation({
    onSuccess: () => refetchMaterials(),
  });

  const deleteMutation = api.admin.learning.deleteMaterial.useMutation({
    onSuccess: () => refetchMaterials(),
  });

  const createSubjectMutation = api.admin.learning.createSubject.useMutation({
    onSuccess: () => refetchSubjects(),
  });

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-600" />;
      case "link":
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Learning Management
        </h1>
        <p className="mt-1 text-gray-500">Manage subjects and materials</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab("materials")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "materials"
              ? "bg-midnight text-white"
              : "border bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <GraduationCap className="ml-2 inline h-4 w-4" />
          Materials
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "subjects"
              ? "bg-midnight text-white"
              : "border bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Plus className="ml-2 inline h-4 w-4" />
          Subjects
        </button>
      </div>

      {activeTab === "materials" && (
        <>
          <div className="flex gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-[#D4AF37] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? "الكل" : status}
                </button>
              ),
            )}
          </div>

          <div className="space-y-4">
            {!materialsData?.materials ||
            materialsData.materials.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No materials found
                </h3>
              </div>
            ) : (
              materialsData.materials.map((material) => (
                <div
                  key={material.id}
                  className={`rounded-xl bg-white p-6 shadow-sm ${
                    material.status === "pending"
                      ? "ring-2 ring-yellow-400"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-gray-100 p-3">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {material.title}
                          </h3>
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${
                              material.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : material.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {material.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {material.subjectName} • By{" "}
                          {material.uploaderName || "Unknown"}
                        </p>
                        {material.description && (
                          <p className="mt-2 text-sm text-gray-600">
                            {material.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          {format(new Date(material.createdAt), "d MMMM yyyy", {
                            locale: ar,
                          })}
                        </p>
                      </div>
                    </div>

                    {material.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            approveMutation.mutate({ materialId: material.id })
                          }
                          className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rejection reason:");
                            if (reason) {
                              rejectMutation.mutate({
                                materialId: material.id,
                                reason,
                              });
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === "subjects" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects?.map((subject) => (
            <div
              key={subject.id}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              style={{ borderTop: `4px solid ${subject.accentColor}` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${subject.accentColor}20` }}
                >
                  <GraduationCap
                    className="h-5 w-5"
                    style={{ color: subject.accentColor }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-500">{subject.code}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Semester {subject.semester}
              </p>
              {subject.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {subject.description}
                </p>
              )}
            </div>
          ))}

          <button
            onClick={() => {
              const name = prompt("Subject name:");
              const code = prompt("Subject code:");
              const semester = parseInt(prompt("Semester (1-10):") || "1");
              const accentColor =
                prompt("Accent color (hex):", "#D4AF37") || "#D4AF37";
              if (name && code) {
                createSubjectMutation.mutate({
                  name,
                  code,
                  semester,
                  accentColor,
                  icon: "book",
                });
              }
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 text-gray-500 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            <Plus className="h-8 w-8" />
            <span>Add Subject</span>
          </button>
        </div>
      )}
    </div>
  );
}
