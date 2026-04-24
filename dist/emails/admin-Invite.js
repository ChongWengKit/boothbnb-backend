import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Html, Preview, Section, Text, Heading, Hr, } from '@react-email/components';
export const AdminInviteEmail = ({ email, token }) => {
    const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
    const url = `${domain}/admin-signup?token=${token}&email=${encodeURIComponent(email)}`;
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsx(Preview, { children: "Invitation to join BoothBnB Admin Team" }), _jsx(Body, { style: main, children: _jsx(Container, { style: container, children: _jsxs(Section, { style: card, children: [_jsx(Heading, { style: h1, children: "Admin Invitation" }), _jsx(Text, { style: text, children: "You have been invited to join the **BoothBnB** administration team." }), _jsx(Text, { style: text, children: "To accept this invitation and set up your account, please click the button below:" }), _jsx(Section, { style: buttonContainer, children: _jsx(Button, { href: url, style: button, children: "Set Up Admin Account" }) }), _jsxs(Text, { style: footer, children: ["This invitation link is intended for **", email, "**. If you were not expecting this invitation, you can ignore this email."] }), _jsx(Hr, { style: hr }), _jsx(Text, { style: footer, children: "For security reasons, this link will expire in 24 hours." })] }) }) })] }));
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
    lineHeight: '24px',
};
//# sourceMappingURL=admin-Invite.js.map