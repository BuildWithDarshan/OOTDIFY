export default function PageHeader({ eyebrow = "OOTDIFY Studio", title, description, icon: Icon, action }) {
    return <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            {Icon && <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm"><Icon size={22} strokeWidth={1.8} /></span>}
            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-500">{eyebrow}</p>
                <h1 className="mt-0.5 font-display text-3xl leading-tight text-green-900 sm:text-4xl">{title}</h1>
                {description && <p className="mt-1 max-w-2xl text-sm leading-6 text-green-600">{description}</p>}
            </div>
        </div>
        {action}
    </div>;
}
