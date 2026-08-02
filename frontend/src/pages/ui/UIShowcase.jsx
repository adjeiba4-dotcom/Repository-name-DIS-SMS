import { useState } from "react";
import { Mail } from "lucide-react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Checkbox from "../../components/ui/Checkbox";
import Divider from "../../components/ui/Divider";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";

import {
    H1,
    H2,
    H3,
    Body,
    Caption,
} from "../../components/ui/Typography";

export default function UIShowcase() {

    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const columns = [
        {
            header: "Student ID",
            accessor: "id",
        },
        {
            header: "Student Name",
            accessor: "name",
        },
        {
            header: "Class",
            accessor: "class",
        },
        {
            header: "Gender",
            accessor: "gender",
        },
        {
            header: "Status",
            accessor: "status",
        },
        {
            header: "Phone",
            accessor: "phone",
        },
    ];

    const students = [
        {
            id: "STD001",
            name: "Emmanuel Adjei",
            class: "SHS 1",
            gender: "Male",
            status: "Active",
            phone: "0241234567",
        },
        {
            id: "STD002",
            name: "Ama Boateng",
            class: "SHS 2",
            gender: "Female",
            status: "Active",
            phone: "0207654321",
        },
        {
            id: "STD003",
            name: "Kwame Asante",
            class: "SHS 3",
            gender: "Male",
            status: "Pending",
            phone: "0554567890",
        },
        {
            id: "STD004",
            name: "Akosua Mensah",
            class: "SHS 1",
            gender: "Female",
            status: "Active",
            phone: "0278889999",
        },
    ];

    return (

        <div className="min-h-screen bg-slate-100">

            {/* ============================
                HEADER
            ============================ */}

            <div className="border-b bg-white shadow-sm">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

                    <div>

                        <H1>
                            DIS-SMS Design System
                        </H1>

                        <Caption className="mt-2">
                            Enterprise UI Library Version 1.0
                        </Caption>

                    </div>

                    <Badge variant="success">
                        Production Ready
                    </Badge>

                </div>

            </div>

            {/* ============================
                PAGE
            ============================ */}

            <div className="mx-auto max-w-7xl space-y-10 p-8">

                {/* FOUNDATION */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Foundation
                    </H2>

                    <Caption className="mb-8">
                        Core typography and layout components.
                    </Caption>

                    <H1>Heading One</H1>

                    <H2 className="mt-5">
                        Heading Two
                    </H2>

                    <H3 className="mt-5">
                        Heading Three
                    </H3>

                    <Body className="mt-5">
                        This is the standard body text used
                        throughout DIS-SMS ERP.
                    </Body>

                    <Caption className="mt-3">
                        Caption text and helper messages.
                    </Caption>

                    <Divider className="mt-8" />

                    <Divider label="OR" />

                    <Divider label="Student Information" />

                    <Divider label="Finance Module" />

                </div>

                {/* FEEDBACK */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Feedback
                    </H2>

                    <Caption className="mb-8">
                        Alert messages and badges.
                    </Caption>

                    <Alert
                        variant="success"
                        title="Success"
                        message="Student saved successfully."
                    />

                    <Alert
                        variant="error"
                        title="Error"
                        message="Unable to login."
                    />

                    <Alert
                        variant="warning"
                        title="Warning"
                        message="Deleting this record cannot be undone."
                    />

                    <Alert
                        variant="info"
                        title="Information"
                        message="System update available."
                    />

                    <div className="mt-8 flex flex-wrap gap-3">

                        <Badge>
                            Administrator
                        </Badge>

                        <Badge variant="success">
                            Active
                        </Badge>

                        <Badge variant="warning">
                            Pending
                        </Badge>

                        <Badge variant="danger">
                            Suspended
                        </Badge>

                        <Badge variant="secondary">
                            Teacher
                        </Badge>

                    </div>

                </div>

                {/* FORM CONTROLS */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Form Controls
                    </H2>

                    <Caption className="mb-8">
                        Standard form components.
                    </Caption>

                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        leftIcon={<Mail size={18} />}
                    />

                    <PasswordInput
                        label="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                    />

                    <div className="mt-5">

                        <Checkbox
                            id="rememberMe"
                            label="Remember Me"
                            checked={rememberMe}
                            onChange={(e) =>
                                setRememberMe(e.target.checked)
                            }
                        />

                    </div>

                </div>
                                {/* BUTTONS */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Buttons
                    </H2>

                    <Caption className="mb-8">
                        Standard action buttons used throughout DIS-SMS.
                    </Caption>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                        <Button>
                            Primary
                        </Button>

                        <Button variant="secondary">
                            Secondary
                        </Button>

                        <Button variant="success">
                            Success
                        </Button>

                        <Button variant="danger">
                            Danger
                        </Button>

                        <Button variant="outline">
                            Outline
                        </Button>

                        <Button variant="ghost">
                            Ghost
                        </Button>

                        <Button loading>
                            Loading
                        </Button>

                    </div>

                </div>

                {/* OVERLAY */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Overlay Components
                    </H2>

                    <Caption className="mb-8">
                        Modal windows used throughout the ERP.
                    </Caption>

                    <Button
                        className="w-auto"
                        onClick={() => setOpenModal(true)}
                    >
                        Open Enterprise Modal
                    </Button>

                </div>

                {/* DATA DISPLAY */}

                <div className="rounded-3xl bg-white p-8 shadow-xl">

                    <H2 className="mb-2">
                        Enterprise Data Table
                    </H2>

                    <Caption className="mb-8">
                        Professional reusable table component.
                    </Caption>

                    <Table
                        title="Student Records"
                        columns={columns}
                        data={students}
                    />

                </div>

            </div>

            {/* ============================
                MODAL
            ============================ */}

            <Modal
                open={openModal}
                title="DIS-SMS Enterprise Modal"
                size="lg"
                onClose={() => setOpenModal(false)}
                footer={
                    <>
                        <Button
                            variant="outline"
                            className="w-auto"
                            onClick={() => setOpenModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="w-auto"
                            onClick={() => setOpenModal(false)}
                        >
                            Save
                        </Button>
                    </>
                }
            >

                <Body>

                    This is the official enterprise modal
                    for DIS-SMS.

                    <br /><br />

                    It will be reused in:

                    <br />• Student Registration
                    <br />• Teacher Registration
                    <br />• Parent Registration
                    <br />• Fee Payments
                    <br />• Library
                    <br />• Inventory
                    <br />• Human Resources
                    <br />• Reports
                    <br />• Settings

                </Body>

            </Modal>

            {/* ============================
                FOOTER
            ============================ */}

            <footer className="mt-12 border-t bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

                    <Caption>
                        © 2026 Data Insight Studio
                    </Caption>

                    <Badge variant="secondary">
                        DIS-SMS UI Library v2.0
                    </Badge>

                </div>

            </footer>

        </div>

    );
}