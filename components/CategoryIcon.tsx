import React from "react";
import * as Icons from "lucide-react";

export function CategoryIcon({ iconName, className = "w-4 h-4" }: { iconName: string; className?: string }) {
  const IconComponent = (Icons as Record<string, any>)[iconName] || Icons.Tag;
  return <IconComponent className={className} />;
}
