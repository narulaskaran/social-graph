"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";

interface ConnectionInput {
  linkedin_url: string;
  first_name: string;
  last_name: string;
}

export function AddToNetworkModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [self, setSelf] = React.useState({
    linkedin_url: "",
    first_name: "",
    last_name: "",
  });
  const [connections, setConnections] = React.useState<ConnectionInput[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const handleConnectionChange = (
    idx: number,
    field: keyof ConnectionInput,
    value: string
  ) => {
    setConnections((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const addConnection = () =>
    setConnections((prev) => [
      ...prev,
      { linkedin_url: "", first_name: "", last_name: "" },
    ]);
  const removeConnection = (idx: number) =>
    setConnections((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ self, connections }),
      });
      const result = await res.json();
      console.log(result);
      setOpen(false);
      setSelf({ linkedin_url: "", first_name: "", last_name: "" });
      setConnections([]);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add to the network</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <fieldset disabled={submitting} className="space-y-4">
            <div className="space-y-2">
              <label className="block font-medium" htmlFor="self-linkedin">
                Your LinkedIn URL
              </label>
              <input
                id="self-linkedin"
                className="block w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
                value={self.linkedin_url}
                onChange={(e) =>
                  setSelf((s) => ({ ...s, linkedin_url: e.target.value }))
                }
                autoFocus
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
              />
              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  placeholder="First name"
                  value={self.first_name}
                  onChange={(e) =>
                    setSelf((s) => ({ ...s, first_name: e.target.value }))
                  }
                />
                <input
                  className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Last name"
                  value={self.last_name}
                  onChange={(e) =>
                    setSelf((s) => ({ ...s, last_name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-medium">Connections</label>
              {connections.map((c, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <input
                    className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="LinkedIn URL"
                    value={c.linkedin_url}
                    onChange={(e) =>
                      handleConnectionChange(
                        idx,
                        "linkedin_url",
                        e.target.value
                      )
                    }
                    type="url"
                  />
                  <input
                    className="w-32 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="First name"
                    value={c.first_name}
                    onChange={(e) =>
                      handleConnectionChange(idx, "first_name", e.target.value)
                    }
                  />
                  <input
                    className="w-32 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    placeholder="Last name"
                    value={c.last_name}
                    onChange={(e) =>
                      handleConnectionChange(idx, "last_name", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove connection"
                    onClick={() => removeConnection(idx)}
                  >
                    -
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addConnection}
                className="mt-2"
              >
                + Add connection
              </Button>
            </div>
          </fieldset>
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
