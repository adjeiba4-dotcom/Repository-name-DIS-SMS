const paymentRepository = require("../repositories/payment.repository");

const {
    BadRequestError,
    NotFoundError,
    ConflictError,
} = require("../errors");



/**
 * Get all active payments
 */
exports.getPayments = async() => {
    return await paymentRepository.findAllPayments();
};



/**
 * Get payment by ID
 */
exports.getPaymentById = async(id) => {

    const payment =
        await paymentRepository.findPaymentById(id);

    if (!payment) {
        throw new NotFoundError("Payment not found.");
    }

    return payment;
};



/**
 * Search payments
 */
exports.searchPayments = async(keyword) => {
    return await paymentRepository.searchPayments(
        keyword || ""
    );
};



/**
 * Get archived payments
 */
exports.getArchivedPayments = async() => {
    return await paymentRepository.findArchivedPayments();
};



/**
 * Generate Receipt Number
 */
const generateReceiptNumber = async() => {

    const year = new Date().getFullYear();

    let counter = 1;

    let receiptNo;

    while (true) {

        receiptNo =
            `RCP-${year}-${String(counter).padStart(6, "0")}`;

        const exists =
            await paymentRepository.findPaymentByReceiptNo(
                receiptNo
            );

        if (!exists) {
            break;
        }

        counter++;
    }

    return receiptNo;
};



/**
 * Create Payment
 */
exports.createPayment = async(data) => {

    const student =
        await paymentRepository.findStudentById(
            data.studentId
        );

    if (!student) {
        throw new NotFoundError(
            "Student not found."
        );
    }

    if (
        Number(data.amount) <= 0
    ) {
        throw new BadRequestError(
            "Payment amount must be greater than zero."
        );
    }

    const receiptNo =
        await generateReceiptNumber();

    return await paymentRepository.createPayment({

        receiptNo,

        studentId: Number(data.studentId),

        paymentDate: new Date(),

        amount: Number(data.amount),

        paymentMethod: data.paymentMethod,

        referenceNo: data.referenceNo || null,

        remarks: data.remarks || null,

        status: "ACTIVE",
    });
};



/**
 * Update Payment
 */
exports.updatePayment = async(
    id,
    data
) => {

    const payment =
        await paymentRepository.findPaymentById(id);

    if (!payment) {
        throw new NotFoundError(
            "Payment not found."
        );
    }

    if (data.studentId) {

        const student =
            await paymentRepository.findStudentById(
                data.studentId
            );

        if (!student) {
            throw new NotFoundError(
                "Student not found."
            );
        }
    }

    if (
        data.amount !== undefined &&
        Number(data.amount) <= 0
    ) {
        throw new BadRequestError(
            "Payment amount must be greater than zero."
        );
    }

    return await paymentRepository.updatePayment(
        id,
        data
    );
};



/**
 * Archive Payment
 */
exports.deletePayment = async(
    id
) => {

    const payment =
        await paymentRepository.findPaymentById(id);

    if (!payment) {
        throw new NotFoundError(
            "Payment not found."
        );
    }

    if (
        payment.allocations &&
        payment.allocations.length > 0
    ) {
        throw new ConflictError(
            "Cannot archive a payment that has payment allocations."
        );
    }

    return await paymentRepository.softDeletePayment(
        id
    );
};



/**
 * Restore Payment
 */
exports.restorePayment = async(
    id
) => {

    const archived =
        await paymentRepository.findArchivedPayments();

    const payment =
        archived.find(
            item => item.id === Number(id)
        );

    if (!payment) {
        throw new NotFoundError(
            "Archived payment not found."
        );
    }

    return await paymentRepository.restorePayment(
        id
    );
};