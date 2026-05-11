import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EMAIL_CONFIG } from '@/config';
import logger from './logger';

// Create SMTP transporter
const createTransporter = (): Transporter => {
    const { smtp } = EMAIL_CONFIG;

    logger.info('Creating SMTP transporter', {
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
    });

    return nodemailer.createTransport({
        host: smtp.host,
        port: Number(smtp.port),

        // For Brevo + Render
        secure: false,
        requireTLS: true,

        auth: {
            user: smtp.auth.user,
            pass: smtp.auth.pass,
        },

        // Force IPv4
        family: 4,

        // Better timeout settings
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,

        // Debug logs
        logger: true,
        debug: true,
    } as SMTPTransport.Options);
};

// Transporter instance
let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
    if (!transporter) {
        transporter = createTransporter();

        // Verify SMTP connection
        transporter.verify(error => {
            if (error) {
                logger.error('SMTP connection verification failed', {
                    error: error.message,
                    stack: error.stack,
                });
            } else {
                logger.info('SMTP server is ready to send emails');
            }
        });
    }

    return transporter;
};

export interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: string | Buffer;
        contentType?: string;
    }>;
}

/**
 * Send email using SMTP
 */
export const sendMail = async (
    options: EmailOptions,
): Promise<any> => {
    const { from } = EMAIL_CONFIG;

    try {
        const mailOptions = {
            from: `"${from.name}" <${from.email}>`,

            to: Array.isArray(options.to)
                ? options.to.join(', ')
                : options.to,

            subject: options.subject,

            html: options.html,

            text:
                options.text ??
                options.html.replace(/<[^>]+>/g, ''),

            cc: options.cc
                ? Array.isArray(options.cc)
                    ? options.cc.join(', ')
                    : options.cc
                : undefined,

            bcc: options.bcc
                ? Array.isArray(options.bcc)
                    ? options.bcc.join(', ')
                    : options.bcc
                : undefined,

            replyTo: options.replyTo,

            attachments: options.attachments,
        };

        const info = await getTransporter().sendMail(
            mailOptions,
        );

        logger.info('Email sent successfully', {
            to: options.to,
            subject: options.subject,
            messageId: info.messageId,
        });

        return info;
    } catch (error: any) {
        logger.error('Failed to send email', {
            to: options.to,
            subject: options.subject,
            error: error.message,
            stack: error.stack,
        });

        throw error;
    }
};

/**
 * Legacy function
 */
export const sendMailLegacy = async (
    to: string,
    subject: string,
    html: string,
    text?: string,
): Promise<any> => {
    return sendMail({
        to,
        subject,
        html,
        text,
    });
};