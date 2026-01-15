"use client";

import { CheckCircleIcon, AlertCircleIcon, CircleIcon } from "../icons";
import moment from "moment";

interface BankSyncStatusProps {
  status: "active" | "expired" | "error";
  lastSyncAt?: string;
}

export default function BankSyncStatus({ status, lastSyncAt }: BankSyncStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircleIcon,
          color: "text-green-500",
          label: "Active",
        };
      case "expired":
        return {
          icon: AlertCircleIcon,
          color: "text-amber-500",
          label: "Expired",
        };
      case "error":
        return {
          icon: AlertCircleIcon,
          color: "text-red-500",
          label: "Error",
        };
      default:
        return {
          icon: CircleIcon,
          color: "text-zinc-400",
          label: "Unknown",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1">
      <Icon size={12} className={config.color} />
      <span className={`text-xs ${config.color}`}>{config.label}</span>
      {lastSyncAt && status === "active" && (
        <span className="text-xs text-zinc-400 ml-1">
          • {moment(lastSyncAt).fromNow()}
        </span>
      )}
    </div>
  );
}
