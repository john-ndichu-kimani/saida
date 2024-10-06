import axios from 'axios';
import dotenv from 'dotenv';
import prisma from '../utils/init.prisma.util';
import { PaymentStatus } from '../interfaces/payment.interface';

dotenv.config();

// Ensure environment variables are defined
const {
  MPESA_CREDENTIALS_URL,
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_API_URL,
  MPESA_SHORTCODE,
  MPESA_PASSKEY,
  CALLBACK_BASE_URL
} = process.env;

if (!MPESA_CREDENTIALS_URL || !MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_API_URL || !MPESA_SHORTCODE || !MPESA_PASSKEY || !CALLBACK_BASE_URL) {
  throw new Error('Missing required environment variables');
}

// Get M-Pesa Access Token
export async function getAccessToken(): Promise<string> {
  try {
    const response = await axios.get(MPESA_CREDENTIALS_URL as string, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    console.log('Access token response:', response.data);
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    throw new Error('Failed to fetch access token');
  }
}


export async function initiatePayment(
  amount: number, 
  phoneNumber: string, 
  userId: string,
  callbackUrl: string = `${CALLBACK_BASE_URL}/api/callback`
): Promise<any> {
  try {
    // Normalize phone number format
    const normalizedPhoneNumber = phoneNumber.replace(/^\+/, '').replace(/^0/, '254'); 

    // Validate phone number
    if (!/^(2547|2541)\d{8}$/.test(normalizedPhoneNumber)) {
      throw new Error('Invalid phone number format. It should be a Kenyan number starting with 2547 or 2541.');
    }

    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').substring(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await axios.post(`${MPESA_API_URL}stkpush/v1/processrequest`, {
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
    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        amount,
        status: PaymentStatus.PENDING,
        paymentDate: new Date(),
        transactionId: checkoutRequestId,
      },
    });

    console.log('Payment record created:', paymentRecord);
    
    return {
      ...response.data,
      paymentRecordId: paymentRecord.id
    };
  } catch (error: any) {
    console.error('Error initiating payment:', error.response?.data || error.message);
    throw new Error('Failed to initiate payment: ' + (error.response?.data?.errorMessage || error.message));
  }
}




// Updated reversePayment function
export async function reversePayment(
  transactionId: string, 
  amount: number, 
  reason: string, 
  callbackUrl: string = `${CALLBACK_BASE_URL}/api/reversal`
): Promise<any> {
  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(`${MPESA_API_URL}reversal/v1/request`, {
      Initiator: 'api_test',
      SecurityCredential: '<YourEncryptedPassword>',  // Replace with actual security credential
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
    await prisma.payment.updateMany({
      where: { transactionId: transactionId },
      data: { status: PaymentStatus.REFUNDED },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error reversing payment:', error.response?.data || error.message);
    
    if (error.response && error.response.data && error.response.data.Envelope) {
      const fault = error.response.data.Envelope.Body.Fault;
      throw new Error(`Failed to reverse payment: ${fault.faultcode} - ${fault.faultstring}`);
    } else {
      throw new Error('Failed to reverse payment: ' + (error.response?.data?.errorMessage || error.message));
    }
  }
    
}
