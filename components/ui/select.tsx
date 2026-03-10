"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectContextType {
    value?: string;
    onValueChange?: (v: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    items: Record<string, React.ReactNode>;
    registerItem: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelect = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within a Select");
    }
    return context;
};

const Select = ({ value, onValueChange, children }: { value?: string, onValueChange?: (v: string) => void, children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState<Record<string, React.ReactNode>>({});

    const registerItem = React.useCallback((val: string, label: React.ReactNode) => {
        setItems(prev => {
            if (prev[val] === label) return prev;
            return { ...prev, [val]: label };
        });
    }, []);

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen, items, registerItem }}>
            <div className="relative w-full group">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const { value, items } = useSelect();
    const displayValue = value && items[value] ? items[value] : value || placeholder;
    return <span className="truncate text-olive-900">{displayValue}</span>
}

const SelectTrigger = ({ className, children, ...props }: any) => {
    const { open, setOpen } = useSelect();

    return (
        <div
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer",
                className
            )}
            onClick={() => setOpen(!open)}
            {...props}
        >
            {children}
            <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
        </div>
    )
}

const SelectContent = ({ className, children, ...props }: any) => {
    const { open } = useSelect();

    return (
        <div
            className={cn(
                "absolute top-full left-0 z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 bg-white border-olive-900/10 select-content",
                !open && "hidden",
                className
            )}
            {...props}
        >
            <div className="p-1">
                {children}
            </div>
        </div>
    )
}

const SelectItem = ({ className, children, value: itemValue, ...props }: any) => {
    const { value, onValueChange, setOpen, registerItem } = useSelect();
    const isSelected = value === itemValue;

    React.useEffect(() => {
        registerItem(itemValue, children);
    }, [itemValue, children, registerItem]);

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-olive-900/5 transition-colors cursor-pointer",
                isSelected && "bg-olive-900/5 font-bold",
                className
            )}
            onClick={() => {
                onValueChange?.(itemValue);
                setOpen(false);
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4 text-olive-900" />}
            </span>
            <div className="text-olive-900">{children}</div>
        </div>
    )
}

export {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
}
