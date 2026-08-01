export default function KPICard({
    title,
    value,
    color = "primary",
}) {
    return (
        <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
                <h6 className="text-muted mb-2">
                    {title}
                </h6>

                <h2 className={`text-${color} fw-bold`}>
                    {value}
                </h2>
            </div>
        </div>
    );
}