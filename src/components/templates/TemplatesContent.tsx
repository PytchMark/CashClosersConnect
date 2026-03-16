"use client";

import { useState } from "react";
import { Search, RefreshCw, Eye, Copy, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Template } from "@/types/database";

interface TemplatesContentProps {
  workspaceId: string;
  templates: Template[];
}

export function TemplatesContent({ templates }: TemplatesContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filteredTemplates = templates.filter((template) => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      if (
        !template.name.toLowerCase().includes(search) &&
        !template.body_text?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (statusFilter && template.status !== statusFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-accent-success" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-accent-error" />;
      case "pending":
        return <Clock className="w-4 h-4 text-accent-warning" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent-success/20 text-accent-success";
      case "rejected":
        return "bg-accent-error/20 text-accent-error";
      case "pending":
        return "bg-accent-warning/20 text-accent-warning";
      case "paused":
        return "bg-dark-600 text-dark-400";
      default:
        return "bg-dark-600 text-dark-400";
    }
  };

  return (
    <div className="h-full flex">
      {/* Templates List */}
      <div className="flex-1 flex flex-col p-6 border-r border-panel-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Message Templates</h2>
            <p className="text-sm text-dark-400">
              {templates.filter((t) => t.status === "approved").length} approved templates
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg font-medium hover:bg-dark-600 transition-colors"
            data-testid="sync-templates-button"
          >
            <RefreshCw className="w-4 h-4" />
            Sync from Meta
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-700 border border-panel-border rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-dark-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-colors"
              data-testid="template-search"
            />
          </div>
          <div className="flex gap-2">
            {[null, "approved", "pending", "rejected"].map((status) => (
              <button
                key={status || "all"}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === status
                    ? "bg-gold-500/20 text-gold-500"
                    : "bg-dark-700 text-dark-300 hover:bg-dark-600"
                }`}
                data-testid={`filter-${status || "all"}`}
              >
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-dark-400">
                No templates found
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`glass-panel rounded-xl p-4 text-left hover:border-gold-500 transition-all ${
                    selectedTemplate?.id === template.id ? "border-gold-500" : ""
                  }`}
                  data-testid={`template-card-${template.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-xs text-dark-400">{template.category || "General"}</p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(template.status)}`}>
                      {getStatusIcon(template.status)}
                      {template.status}
                    </span>
                  </div>
                  <p className="text-sm text-dark-300 line-clamp-3 mb-3">
                    {template.body_text || "No body text"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-dark-500">
                    <span>{template.language_code}</span>
                    <span>{formatRelativeTime(template.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="w-96 bg-panel p-6 overflow-y-auto">
        {selectedTemplate ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Template Preview</h3>
              <button
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                title="Copy template name"
              >
                <Copy className="w-4 h-4 text-dark-400" />
              </button>
            </div>

            {/* Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-dark-400 block mb-1">Name</label>
                <p className="font-medium">{selectedTemplate.name}</p>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">Category</label>
                <p>{selectedTemplate.category || "General"}</p>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">Language</label>
                <p>{selectedTemplate.language_code}</p>
              </div>
              <div>
                <label className="text-xs text-dark-400 block mb-1">Status</label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedTemplate.status)}`}>
                  {getStatusIcon(selectedTemplate.status)}
                  {selectedTemplate.status}
                </span>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="text-xs text-dark-400 block mb-2">Message Preview</label>
              <div className="bg-dark-700 rounded-xl p-4">
                {selectedTemplate.header_type && (
                  <div className="mb-2 pb-2 border-b border-panel-border">
                    <span className="text-xs text-dark-400">[{selectedTemplate.header_type} Header]</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">
                  {selectedTemplate.body_text || "No body text"}
                </p>
                {selectedTemplate.footer_text && (
                  <p className="text-xs text-dark-400 mt-3">
                    {selectedTemplate.footer_text}
                  </p>
                )}
              </div>
            </div>

            {/* Variables */}
            {Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.length > 0 && (
              <div className="mt-4">
                <label className="text-xs text-dark-400 block mb-2">Variables</label>
                <div className="space-y-2">
                  {(selectedTemplate.variables as string[]).map((variable, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-0.5 bg-gold-500/20 text-gold-500 rounded text-xs font-mono">
                        {`{{${i + 1}}}`}
                      </span>
                      <span className="text-dark-400">{variable}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Eye className="w-12 h-12 text-dark-500 mb-4" />
            <h3 className="font-medium mb-2">Select a Template</h3>
            <p className="text-sm text-dark-400">
              Click on a template to preview its content
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
