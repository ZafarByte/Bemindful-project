"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const activityTypes = [
    { id: "meditation", name: "Meditation" },
    { id: "exercise", name: "Exercise" },
    { id: "walking", name: "Walking" },
    { id: "reading", name: "Reading" },
    { id: "journaling", name: "Journaling" },
    { id: "therapy", name: "Therapy Session" },
];

interface ActivityLoggerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Make optional so callers that only pass open/onOpenChange won't error
    onActivityLogged?: () => void;
}

export function ActivityLogger({
    open,
    onOpenChange,
    onActivityLogged,
}: ActivityLoggerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [type, setType] = useState("");
    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // mock async save
        setTimeout(() => {
            console.log({
                type,
                name,
                duration,
                description,
            });

            // Call optional callback to notify parent
            if (onActivityLogged) {
                try {
                    onActivityLogged();
                } catch (err) {
                    // ignore callback errors
                    console.warn("onActivityLogged callback failed:", err);
                }
            }

            // Reset fields
            setType("");
            setName("");
            setDuration("");
            setDescription("");
            setIsLoading(false);

            // Close modal
            onOpenChange(false);

            // small feedback (replace with toast in real app)
            alert("Activity logged");
        }, 900);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Activity</DialogTitle>
                    <DialogDescription>Record your wellness activity</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Activity Type</Label>
                        <Select value={type} onValueChange={(v) => setType(String(v))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent>
                                {activityTypes.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Morning Meditation, Evening Walk, etc."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="15"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="How did it go?"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Activity"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
