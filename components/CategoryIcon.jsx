import React from "react";
import * as Icons from "lucide-react";
export function CategoryIcon({ iconName, className = "w-4 h-4" }) {
    const IconComponent = Icons[iconName] || Icons.Tag;
    return <IconComponent className={className}/>;
}
