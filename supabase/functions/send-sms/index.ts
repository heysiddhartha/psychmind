// Supabase Edge Function for sending SMS notifications
// Supports Twilio and MSG91

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  to: string;
  message: string;
  templateId?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// SMS Provider configuration (set via environment variables)
const SMS_PROVIDER = Deno.env.get("SMS_PROVIDER") || "twilio"; // 'twilio' or 'msg91'

// Twilio credentials
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

// MSG91 credentials
const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY");
const MSG91_SENDER_ID = Deno.env.get("MSG91_SENDER_ID") || "THE3TR";
const MSG91_ROUTE = Deno.env.get("MSG91_ROUTE") || "4"; // Transactional route

async function sendViaTwilio(to: string, message: string): Promise<SMSResponse> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: to,
          Body: message,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.sid };
    } else {
      return { success: false, error: data.message || "Twilio error" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendViaMSG91(to: string, message: string, templateId?: string): Promise<SMSResponse> {
  if (!MSG91_AUTH_KEY) {
    return { success: false, error: "MSG91 credentials not configured" };
  }

  try {
    // Format phone number for MSG91 (remove + prefix)
    const formattedPhone = to.replace(/^\+/, "");

    const response = await fetch("https://api.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        template_id: templateId,
        sender: MSG91_SENDER_ID,
        mobiles: formattedPhone,
        message: message,
      }),
    });

    const data = await response.json();

    if (data.type === "success") {
      return { success: true, messageId: data.request_id };
    } else {
      return { success: false, error: data.message || "MSG91 error" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message, templateId }: SMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'to' or 'message'" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`📱 Sending SMS to ${to} via ${SMS_PROVIDER}`);

    let result: SMSResponse;

    if (SMS_PROVIDER === "msg91") {
      result = await sendViaMSG91(to, message, templateId);
    } else {
      result = await sendViaTwilio(to, message);
    }

    console.log(result.success ? "✅ SMS sent" : `❌ SMS failed: ${result.error}`);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SMS function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
