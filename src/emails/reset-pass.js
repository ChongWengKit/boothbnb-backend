import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Html, Preview, Section, Text, Heading, Hr, } from '@react-email/components';
export const ResetPasswordEmail = ({ username, token }) => {
    const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
    const url = `${domain}/reset-password?token=${token}`;
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsx(Preview, { children: "Reset your password" }), _jsx(Body, { style: main, children: _jsx(Container, { style: container, children: _jsxs(Section, { style: card, children: [_jsx(Heading, { style: h1, children: "Reset your password" }), _jsxs(Text, { style: text, children: ["Hi **", username, "**,"] }), _jsx(Text, { style: text, children: "We received a request to reset the password for your account. Click the button below to choose a new one." }), _jsx(Section, { style: buttonContainer, children: _jsx(Button, { href: url, style: button, children: "Reset Password" }) }), _jsx(Text, { style: text, children: "**Note:** This link will expire in 1 hour for security reasons. If you did not request a password reset, please ignore this email or contact support if you have concerns." }), _jsx(Hr, { style: hr }), _jsx(Text, { style: footer, children: "For your security, never share this link with anyone. Our team will never ask for your password over email." })] }) }) })] }));
};
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const container = {
    margin: '0 auto',
    padding: '40px 0 64px',
};
const card = {
    backgroundColor: '#ffffff',
    border: '1px solid #e6ebf1',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
};
const h1 = {
    color: '#1f2937',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '40px',
    margin: '0 0 20px',
};
const text = {
    color: '#4b5563',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left',
};
const buttonContainer = {
    textAlign: 'center',
    margin: '32px 0',
};
const button = {
    backgroundColor: '#000000',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '12px 0',
};
const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};
const footer = {
    color: '#9ca3af',
    fontSize: '14px',
    lineHeight: '22px',
    textAlign: 'left',
};
//# sourceMappingURL=reset-pass.js.map