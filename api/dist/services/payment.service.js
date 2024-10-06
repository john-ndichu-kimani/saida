"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = getAccessToken;
exports.initiatePayment = initiatePayment;
exports.reversePayment = reversePayment;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const init_prisma_util_1 = __importDefault(require("../utils/init.prisma.util"));
const payment_interface_1 = require("../interfaces/payment.interface");
dotenv_1.default.config();
// Ensure environment variables are defined
const { MPESA_CREDENTIALS_URL, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_API_URL, MPESA_SHORTCODE, MPESA_PASSKEY, CALLBACK_BASE_URL } = process.env;
if (!MPESA_CREDENTIALS_URL || !MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_API_URL || !MPESA_SHORTCODE || !MPESA_PASSKEY || !CALLBACK_BASE_URL) {
    throw new Error('Missing required environment variables');
}
// Get M-Pesa Access Token
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.get(MPESA_CREDENTIALS_URL, {
                headers: {
                    Authorization: 'Basic ' + Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64'),
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log('Access token response:', response.data);
            return response.data.access_token;
        }
        catch (error) {
            console.error('Error fetching access token:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error('Failed to fetch access token');
        }
    });
}
function initiatePayment(amount_1, phoneNumber_1, userId_1) {
    return __awaiter(this, arguments, void 0, function* (amount, phoneNumber, userId, callbackUrl = `${CALLBACK_BASE_URL}/api/callback`) {
        var _a, _b, _c;
        try {
            // Normalize phone number format
            const normalizedPhoneNumber = phoneNumber.replace(/^\+/, '').replace(/^0/, '254');
            // Validate phone number
            if (!/^(2547|2541)\d{8}$/.test(normalizedPhoneNumber)) {
                throw new Error('Invalid phone number format. It should be a Kenyan number starting with 2547 or 2541.');
            }
            const accessToken = yield getAccessToken();
            const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').substring(0, 14);
            const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
            const response = yield axios_1.default.post(`${MPESA_API_URL}stkpush/v1/processrequest`, {
                BusinessShortCode: MPESA_SHORTCODE,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: amount,
                PartyA: normalizedPhoneNumber,
                PartyB: MPESA_SHORTCODE,
                PhoneNumber: normalizedPhoneNumber,
                CallBackURL: callbackUrl,
                AccountReference: 'Account123',
                TransactionDesc: 'Payment for service',
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('M-Pesa API Response:', response.data);
            // Extract CheckoutRequestID from response
            const checkoutRequestId = response.data.CheckoutRequestID;
            if (!checkoutRequestId) {
                throw new Error('CheckoutRequestID not found in M-Pesa response');
            }
            // Save the payment record with the CheckoutRequestID
            const paymentRecord = yield init_prisma_util_1.default.payment.create({
                data: {
                    userId,
                    amount,
                    status: payment_interface_1.PaymentStatus.PENDING,
                    paymentDate: new Date(),
                    transactionId: checkoutRequestId,
                },
            });
            console.log('Payment record created:', paymentRecord);
            return Object.assign(Object.assign({}, response.data), { paymentRecordId: paymentRecord.id });
        }
        catch (error) {
            console.error('Error initiating payment:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error('Failed to initiate payment: ' + (((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errorMessage) || error.message));
        }
    });
}
// Updated reversePayment function
function reversePayment(transactionId_1, amount_1, reason_1) {
    return __awaiter(this, arguments, void 0, function* (transactionId, amount, reason, callbackUrl = `${CALLBACK_BASE_URL}/api/reversal`) {
        var _a, _b, _c;
        try {
            const accessToken = yield getAccessToken();
            const response = yield axios_1.default.post(`${MPESA_API_URL}reversal/v1/request`, {
                Initiator: 'api_test',
                SecurityCredential: '<YourEncryptedPassword>', // Replace with actual security credential
                CommandID: 'TransactionReversal',
                TransactionID: transactionId,
                Amount: amount,
                ReceiverParty: MPESA_SHORTCODE,
                RecieverIdentifierType: '11',
                Remarks: reason,
                QueueTimeOutURL: `${callbackUrl}/timeout`,
                ResultURL: `${callbackUrl}/result`,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Reversal API Response:', response.data);
            if (response.data.Envelope && response.data.Envelope.Body && response.data.Envelope.Body.Fault) {
                const fault = response.data.Envelope.Body.Fault;
                throw new Error(`M-Pesa API Fault: ${fault.faultcode} - ${fault.faultstring}`);
            }
            // Update payment status in database
            yield init_prisma_util_1.default.payment.updateMany({
                where: { transactionId: transactionId },
                data: { status: payment_interface_1.PaymentStatus.REFUNDED },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error reversing payment:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            if (error.response && error.response.data && error.response.data.Envelope) {
                const fault = error.response.data.Envelope.Body.Fault;
                throw new Error(`Failed to reverse payment: ${fault.faultcode} - ${fault.faultstring}`);
            }
            else {
                throw new Error('Failed to reverse payment: ' + (((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.errorMessage) || error.message));
            }
        }
    });
}
