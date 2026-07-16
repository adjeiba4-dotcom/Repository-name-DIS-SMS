export default function Footer() {
    return (
        <footer
            className="bg-dark text-white text-center py-3"
        >
            <small>

                © {new Date().getFullYear()} DIS-SMS —
                Data Insight School Management System

            </small>
        </footer>
    );
}