import { Check, ClipboardList, ImagePlus, Layers3, ShoppingBag } from "lucide-react";

const steps = [
    { number: 1, label: "Analyze", detail: "Choose inspiration", icon: ImagePlus },
    { number: 2, label: "Outfit draft", detail: "Shape the story", icon: ClipboardList },
    { number: 3, label: "Garments", detail: "Find the pieces", icon: Layers3 },
    { number: 4, label: "Review & save", detail: "Finish the look", icon: ShoppingBag },
];

export default function AnalyzerStepNav({ activeStep, hasDraft, onStepChange }) {
    return <nav aria-label="Outfit creation steps" className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {steps.map(({ number, label, detail, icon: Icon }) => {
            const active = number === activeStep;
            const complete = number < activeStep;
            const available = number === 1 || hasDraft;
            return <button key={number} type="button" onClick={() => onStepChange(number)}
                disabled={!available} aria-current={active ? "step" : undefined}
                className={`group flex min-h-20 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all sm:px-4 ${
                    active ? "border-green-700 bg-green-700 text-white shadow-lg shadow-green-800/15" :
                        complete ? "border-green-200 bg-green-50 text-green-800 hover:border-green-400" :
                            "border-green-100 bg-white text-green-800 hover:border-green-300 disabled:cursor-not-allowed disabled:opacity-45"
                }`}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active ? "bg-white/15" : complete ? "bg-white" : "bg-green-50"
                }`}>
                    {complete ? <Check size={19} strokeWidth={2.3} /> : <Icon size={19} strokeWidth={1.9} />}
                </span>
                <span className="min-w-0">
                    <span className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        active ? "text-green-100" : "text-green-600"
                    }`}>Step {number}</span>
                    <span className="block truncate text-sm font-semibold sm:text-base">{label}</span>
                    <span className={`hidden text-xs sm:block ${active ? "text-green-100" : "text-green-600"}`}>
                        {detail}
                    </span>
                </span>
            </button>;
        })}
    </nav>;
}
