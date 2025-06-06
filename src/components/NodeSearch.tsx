"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useState } from "react";

interface Node {
  id: string;
  label: string;
}

interface NodeSearchProps {
  nodes: Node[];
  onSelect: (node: Node) => void;
}

export function NodeSearch({ nodes, onSelect }: NodeSearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          {value
            ? nodes.find((node) => node.id === value)?.label
            : "Search for a person..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search for a person..." />
          <CommandEmpty>No person found.</CommandEmpty>
          <CommandGroup>
            {nodes.map((node) => (
              <CommandItem
                key={node.id}
                value={node.id}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue);
                  setOpen(false);
                  const selectedNode = nodes.find((n) => n.id === currentValue);
                  if (selectedNode) {
                    onSelect(selectedNode);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === node.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {node.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
