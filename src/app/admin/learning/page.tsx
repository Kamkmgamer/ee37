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
  Clock,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const satisfies Variants;

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  } as const satisfies Variants;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-2 sm:p-6"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-[#D4AF37] uppercase">
            Academy
          </p>
          <h1 className="text-3xl font-light text-[#0a1628] sm:text-4xl">
            Learning Management
          </h1>
        </div>

        <div className="flex rounded-lg border border-[#0a1628]/5 bg-white p-1 shadow-sm">
          {[
            {
              id: "materials" as const,
              label: "Materials",
              icon: GraduationCap,
            },
            { id: "subjects" as const, label: "Subjects", icon: Plus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#0a1628] text-[#D4AF37] shadow-sm"
                  : "text-[#0a1628]/60 hover:bg-[#faf7f0] hover:text-[#0a1628]"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "materials" && (
        <>
          <div className="flex gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === status
                      ? "bg-[#D4AF37] text-white shadow-sm"
                      : "border border-[#0a1628]/10 bg-white text-[#0a1628]/60 hover:border-[#D4AF37]/30 hover:text-[#0a1628]"
                  }`}
                >
                  {status === "all"
                    ? "الكل"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {!materialsData?.materials ||
            materialsData.materials.length === 0 ? (
              <motion.div
                variants={item}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0a1628]/10 bg-[#faf7f0]/30 py-16 text-center"
              >
                <div className="mb-4 rounded-full bg-[#0a1628]/5 p-4 text-[#0a1628]/40">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-[#0a1628]">
                  No materials found
                </h3>
                <p className="text-[#0a1628]/50">
                  {statusFilter !== "all"
                    ? `No ${statusFilter} materials`
                    : "Try adjusting filters"}
                </p>
              </motion.div>
            ) : (
              materialsData.materials.map((material) => (
                <motion.div
                  key={material.id}
                  variants={item}
                  className={`group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md ${
                    material.status === "pending"
                      ? "border-[#D4AF37]/30"
                      : "border-[#0a1628]/5"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#0a1628]/10 bg-[#faf7f0]">
                      {getMaterialIcon(material.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-[#0a1628]">
                          {material.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                            material.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : material.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-[#D4AF37]/10 text-[#D4AF37]"
                          }`}
                        >
                          {material.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#0a1628]/60">
                        <span>{material.subjectName}</span>
                        <span className="text-[#D4AF37]/40">•</span>
                        <span>By {material.uploaderName ?? "Unknown"}</span>
                        <span className="text-[#D4AF37]/40">•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(material.createdAt), "d MMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                      {material.description && (
                        <p className="text-sm text-[#0a1628]/70">
                          {material.description}
                        </p>
                      )}
                    </div>

                    {material.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            approveMutation.mutate({ materialId: material.id })
                          }
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                        >
                          <CheckCircle size={14} />
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
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </>
      )}

      {activeTab === "subjects" && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {subjects?.map((subject) => (
            <motion.div
              key={subject.id}
              variants={item}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-xl border border-[#0a1628]/5 bg-white p-6 shadow-sm transition-all hover:border-[#D4AF37]/30 hover:shadow-md"
              style={{ borderTop: `4px solid ${subject.accentColor}` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="rounded-lg p-2.5"
                  style={{ backgroundColor: `${subject.accentColor}20` }}
                >
                  <GraduationCap
                    className="h-5 w-5"
                    style={{ color: subject.accentColor }}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-[#0a1628]">{subject.name}</h3>
                  <p className="font-mono text-xs text-[#0a1628]/50">
                    {subject.code}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#0a1628]/60">
                  <span className="font-medium">Semester</span>
                  <span className="rounded-full bg-[#0a1628]/5 px-2 py-0.5 font-mono text-[#0a1628]">
                    {subject.semester}
                  </span>
                </div>
                {subject.description && (
                  <p className="line-clamp-2 text-sm text-[#0a1628]/70">
                    {subject.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          <motion.button
            variants={item}
            onClick={() => {
              const name = prompt("Subject name:");
              const code = prompt("Subject code:");
              const semester = parseInt(prompt("Semester (1-10):") ?? "1");
              const accentColor =
                prompt("Accent color (hex):", "#D4AF37") ?? "#D4AF37";
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
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0a1628]/10 bg-[#faf7f0]/50 p-6 text-[#0a1628]/50 transition-all hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">Add Subject</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
