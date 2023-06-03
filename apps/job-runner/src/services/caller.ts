import twilio from 'twilio';
import { isLambda } from '../utils.js';

export async function call(params: { to: string; twiml: string }) {
  let accountSid: string;
  let authToken: string;
  let fromNumber: string;
  if (isLambda()) {
    ({
      twilioConfig: { accountSid, authToken, fromNumber },
    } = JSON.parse(process.env.TWILIO!));
  } else {
    accountSid = process.env.TWILIO_ACCOUNT_SID!;
    authToken = process.env.TWILIO_AUTH_TOKEN!;
    fromNumber = process.env.TWILIO_FROM_NUMBER!;
  }
  const client = twilio(accountSid, authToken);
  await client.calls.create({
    to: params.to,
    from: fromNumber,
    twiml: params.twiml,
  });
}

export async function callMe(params: { twiml: string }) {
  let myNumber: string;
  if (isLambda()) {
    ({
      twilioConfig: { myNumber },
    } = JSON.parse(process.env.TWILIO!));
  } else {
    myNumber = process.env.TWILIO_MY_NUMBER!;
  }
  await call({
    to: myNumber,
    twiml: params.twiml,
  });
}
