import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { envConfig } from '../configs/env.config.js';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTPEmail(payload: { email: string; otpCode: string }) {
    const { data, error } = await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [payload.email],
      subject: 'Otp code verify email',
      html: `<strong>Your otp: ${payload.otpCode}</strong>`,
    });

    return { data, error };
  }
}
