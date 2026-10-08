import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { envConfig } from '../configs/env.config.js';
import fs from 'fs';
import path from 'path';
import { pretty, render } from 'react-email';
import OTPComponent from '../../emails/OTPComponent.js';

const otpTemplate = fs.readFileSync(
  path.join(path.resolve(), '/src/shared/email-template/otp.html'),
  'utf-8',
);

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  async sendOTPEmail(payload: { email: string; otpCode: string }) {
    const subject = 'Otp code verify email';
    const reactEmailTemplate = await pretty(
      await render(
        <OTPComponent otpCode={payload.otpCode} subject={subject} />,
      ),
    );

    const { data, error } = await this.resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [payload.email],
      subject,
      react: reactEmailTemplate,
      //html: otpTemplate.replaceAll('{{OTP}}', payload.otpCode),
    });

    return { data, error };
  }
}
