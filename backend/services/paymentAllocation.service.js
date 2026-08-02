const paymentAllocationRepository = require("../repositories/paymentAllocation.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");

/**
 * Get all payment allocations
 */
const getPaymentAllocations = async() => {
    return await paymentAllocationRepository.findAllPaymentAllocations();
};

/**
 * Get payment allocation by ID
 */
const getPaymentAllocationById = async(id) => {

    const allocation =
        await paymentAllocationRepository.findPaymentAllocationById(
            Number(id)
        );

    if (!allocation) {
        throw new NotFoundError(
            "Payment allocation not found."
        );
    }

    return allocation;
};

/**
 * Search payment allocations
 */
const searchPaymentAllocations = async(keyword) => {
    return await paymentAllocationRepository.searchPaymentAllocations(
        keyword || ""
    );
};

/**
 * Create payment allocation
 */
const createPaymentAllocation = async(data) => {

    data.paymentId = Number(data.paymentId);
    data.invoiceId = Number(data.invoiceId);
    data.amountApplied = Number(data.amountApplied);

    if (Number.isNaN(data.amountApplied)) {
        throw new BadRequestError(
            "Allocated amount must be a valid number."
        );
    }

    if (data.amountApplied <= 0) {
        throw new BadRequestError(
            "Allocated amount must be greater than zero."
        );
    }

    const payment =
        await paymentAllocationRepository.findPaymentById(
            data.paymentId
        );

    if (!payment) {
        throw new NotFoundError(
            "Payment not found."
        );
    }

    const invoice =
        await paymentAllocationRepository.findInvoiceById(
            data.invoiceId
        );

    if (!invoice) {
        throw new NotFoundError(
            "Invoice not found."
        );
    }

    const duplicate =
        await paymentAllocationRepository.findDuplicateAllocation(
            data.paymentId,
            data.invoiceId
        );

    if (duplicate) {
        throw new ConflictError(
            "This payment has already been allocated to this invoice."
        );
    }

    if (data.amountApplied > Number(invoice.balance)) {
        throw new BadRequestError(
            "Allocated amount cannot exceed the invoice balance."
        );
    }

    const allocatedAmount =
        payment.allocations.reduce(
            (total, allocation) =>
            total + Number(allocation.amountApplied),
            0
        );

    const remainingPayment =
        Number(payment.amount) - allocatedAmount;

    if (data.amountApplied > remainingPayment) {
        throw new BadRequestError(
            "Allocated amount exceeds the remaining payment amount."
        );
    }

    return await paymentAllocationRepository.prisma.$transaction(
        async(tx) => {

            const allocation =
                await paymentAllocationRepository.createPaymentAllocation(
                    tx, {
                        paymentId: data.paymentId,
                        invoiceId: data.invoiceId,
                        amountApplied: data.amountApplied,
                    }
                );

            const newBalance =
                Number(invoice.balance) -
                data.amountApplied;

            await paymentAllocationRepository.updateStudentInvoiceBalance(
                tx,
                data.invoiceId,
                newBalance
            );

            return allocation;
        }
    );
};

/**
 * Update payment allocation
 */
const updatePaymentAllocation = async(
    id,
    data
) => {

    const allocation =
        await paymentAllocationRepository.findPaymentAllocationById(
            Number(id)
        );

    if (!allocation) {
        throw new NotFoundError(
            "Payment allocation not found."
        );
    }

    return await paymentAllocationRepository.updatePaymentAllocation(
        Number(id),
        data
    );
};

/**
 * Delete payment allocation
 */
const deletePaymentAllocation = async(id) => {

    const allocation =
        await paymentAllocationRepository.findPaymentAllocationById(
            Number(id)
        );

    if (!allocation) {
        throw new NotFoundError(
            "Payment allocation not found."
        );
    }

    return await paymentAllocationRepository.prisma.$transaction(
        async(tx) => {

            const invoice =
                await paymentAllocationRepository.findInvoiceById(
                    allocation.invoiceId
                );

            const restoredBalance =
                Number(invoice.balance) +
                Number(allocation.amountApplied);

            await paymentAllocationRepository.updateStudentInvoiceBalance(
                tx,
                allocation.invoiceId,
                restoredBalance
            );

            await tx.paymentAllocation.delete({
                where: {
                    id: Number(id),
                },
            });

            return true;
        }
    );
};

module.exports = {
    getPaymentAllocations,
    getPaymentAllocationById,
    searchPaymentAllocations,
    createPaymentAllocation,
    updatePaymentAllocation,
    deletePaymentAllocation,
};