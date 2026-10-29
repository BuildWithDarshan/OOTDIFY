import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PageHeader from "./PageHeader.jsx";

export default function FormPageShell({ title, description, icon, backTo, children }) {
    return <div className="max-w-5xl">
        <PageHeader icon={icon} title={title} description={description}
            action={<Link to={backTo} className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"><ArrowLeft size={16} /> Back to list</Link>} />
        {children}
    </div>;
}
