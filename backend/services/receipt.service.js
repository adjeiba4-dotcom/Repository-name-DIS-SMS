// services/receipt.service.js

const receiptRepository = require("../repositories/receipt.repository");

const getReceipts = async() => {
    return await receiptRepository.findAllReceipts();
};

const getReceiptById = async(id) => {
    const receipt = await receiptRepository.findReceiptById(id);

    if (!receipt) {
        throw new Error("Receipt not found.");
    }

    return receipt;
};

const searchReceipts = async(keyword) => {
    return await receiptRepository.searchReceipts(keyword || "");
};

const createReceipt = async(data) => {
    const payment = await receiptRepository.findPaymentById(
        data.paymentId
    );

    if (!payment) {
        throw new Error("Payment not found.");
    }

    const existingReceipt =
        await receiptRepository.findReceiptByPaymentId(
            data.paymentId
        );

    if (existingReceipt) {
        throw new Error(
            "A receipt has already been generated for this payment."
        );
    }

    const year = new Date().getFullYear();

    const receipts =
        await receiptRepository.findAllReceipts();

    const nextNumber = String(receipts.length + 1).padStart(6, "0");

    const receiptNumber = `RCT-${year}-${nextNumber}`;

    return await receiptRepository.createReceipt({
        receiptNumber,
        paymentId: data.paymentId,
        printedBy: data.printedBy || null,
        remarks: data.remarks || null,
    });
};

const updateReceipt = async(id, data) => {
    const receipt =
        await receiptRepository.findReceiptById(id);

    if (!receipt) {
        throw new Error("Receipt not found.");
    }

    return await receiptRepository.updateReceipt(id, {
        printedBy: data.printedBy,
        remarks: data.remarks,
    });
};

const deleteReceipt = async(id) => {
    const receipt =
        await receiptRepository.findReceiptById(id);

    if (!receipt) {
        throw new Error("Receipt not found.");
    }

    await receiptRepository.deleteReceipt(id);

    return true;
};

module.exports = {
    getReceipts,
    getReceiptById,
    searchReceipts,
    createReceipt,
    updateReceipt,
    deleteReceipt,
};