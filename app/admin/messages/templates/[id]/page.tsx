"use client";

import { MessageTemplateEditor } from "@/components/admin/MessageTemplateEditor";
import { useParams } from "next/navigation";

export default function EditMessageTemplatePage() {
    const params = useParams<{ id: string }>();

    return (
        <div className="space-y-6">
            <MessageTemplateEditor templateId={params?.id} />
        </div>
    );
}
