import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiRespone";
import VerificationEmail from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
  username: string,
  email: string,
  verifyCode: string,
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Mystery Message Verification Code",
      react: VerificationEmail({ username: username, otp: verifyCode }),
    });
    return { success: true, message: "Verification email sent successfully." };
  } catch (emailError) {
    console.log("Error sending verification email", emailError);
    return { success: false, message: "failed to send verification email" };
  }
}
