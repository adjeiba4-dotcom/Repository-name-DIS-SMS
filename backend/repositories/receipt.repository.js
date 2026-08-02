// repositories/receipt.repository.js

const prisma = require("../database/db");

const findAllReceipts = async() => {
    return await prisma.receipt.findMany({
        include: {
            payment: {
                include: {
                    student: true,
                    allocations: {
                        include: {
                            invoice: {
                                include: {
                                    feeStructure: {
                                        include: {
                                            academicYear: true,
                                            schoolClass: true,
                                            feeType: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            issuedDate: "desc",
        },
    });
};

const findReceiptById = async(id) => {
    return await prisma.receipt.findUnique({
        where: { id },
        include: {
            payment: {
                include: {
                    student: true,
                    allocations: {
                        include: {
                            invoice: {
                                include: {
                                    feeStructure: {
                                        include: {
                                            academicYear: true,
                                            schoolClass: true,
                                            feeType: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};

const findReceiptByNumber = async(receiptNumber) => {
    return await prisma.receipt.findUnique({
        where: {
            receiptNumber,
        },
    });
};

const findReceiptByPaymentId = async(paymentId) => {
    return await prisma.receipt.findUnique({
        where: {
            paymentId,
        },
    });
};

const findPaymentById = async(paymentId) => {
    return await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
        include: {
            student: true,
            allocations: {
                include: {
                    invoice: true,
                },
            },
        },
    });
};

const searchReceipts = async(keyword) => {
    return await prisma.receipt.findMany({
        where: {
            OR: [{
                    receiptNumber: {
                        contains: keyword,
                    },
                },
                {
                    payment: {
                        receiptNo: {
                            contains: keyword,
                        },
                    },
                },
                {
                    payment: {
                        student: {
                            admissionNumber: {
                                contains: keyword,
                            },
                        },
                    },
                },
                {
                    payment: {
                        student: {
                            firstName: {
                                contains: keyword,
                            },
                        },
                    },
                },
                {
                    payment: {
                        student: {
                            lastName: {
                                contains: keyword,
                            },
                        },
                    },
                },
            ],
        },
        include: {
            payment: {
                include: {
                    student: true,
                    allocations: {
                        include: {
                            invoice: {
                                include: {
                                    feeStructure: {
                                        include: {
                                            academicYear: true,
                                            schoolClass: true,
                                            feeType: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            issuedDate: "desc",
        },
    });
};

const createReceipt = async(data) => {
    return await prisma.receipt.create({
        data,
        include: {
            payment: {
                include: {
                    student: true,
                },
            },
        },
    });
};

const updateReceipt = async(id, data) => {
    return await prisma.receipt.update({
        where: {
            id,
        },
        data,
        include: {
            payment: {
                include: {
                    student: true,
                },
            },
        },
    });
};

const deleteReceipt = async(id) => {
    return await prisma.receipt.delete({
        where: {
            id,
        },
    });
};

module.exports = {
    findAllReceipts,
    findReceiptById,
    findReceiptByNumber,
    findReceiptByPaymentId,
    findPaymentById,
    searchReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
};