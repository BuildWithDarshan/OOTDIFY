const DataTable = ({ columns, rows, onEdit, onDelete, emptyMessage = "Nothing here yet." }) => {
    const showActions = Boolean(onEdit || onDelete);
 
    if (rows.length === 0) {
        return <p className="text-text-secondary text-sm py-8 text-center">{emptyMessage}</p>;
    }
 
    return (
        <>
            {/* Table view — sm and up */}
            <div className="hidden sm:block overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-bg-subtle">
                            {columns.map((col) => (
                                <th key={col.key} className="text-left px-4 py-3 text-text-secondary font-medium">
                                    {col.label}
                                </th>
                            ))}
                            {showActions && <th className="px-4 py-3"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row._id} className="border-b border-border last:border-0">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-text-primary">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                                {showActions && (
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="text-accent-hover hover:underline mr-3"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
 
            {/* Card view — below sm */}
            <div className="sm:hidden space-y-3">
                {rows.map((row) => (
                    <div key={row._id} className="border border-border rounded-xl p-4">
                        {columns.map((col) => (
                            <div key={col.key} className="flex justify-between text-sm py-1">
                                <span className="text-text-secondary">{col.label}</span>
                                <span className="text-text-primary text-right">
                                    {col.render ? col.render(row) : row[col.key]}
                                </span>
                            </div>
                        ))}
                        {showActions && (
                            <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                                {onEdit && (
                                    <button onClick={() => onEdit(row)} className="text-accent-hover text-sm">
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button onClick={() => onDelete(row)} className="text-red-500 text-sm">
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};
 
export default DataTable;