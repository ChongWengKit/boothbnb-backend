import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Button, Container, Head, Html, Preview, Section, Text, Heading, Hr, } from '@react-email/components';
export const BookingConfirmedEmail = ({ username, event, booth, bookingId }) => {
    const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
    const url = `${domain}/booking/${bookingId}`;
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Preview, { children: ["Booking Confirmed: ", event] }), _jsx(Body, { style: main, children: _jsx(Container, { style: container, children: _jsxs(Section, { style: card, children: [_jsx(Heading, { style: h1, children: "Booking Confirmed!" }), _jsxs(Text, { style: text, children: ["Hi **", username, "**,"] }), _jsxs(Text, { style: text, children: ["Your spot at **", event, "** is officially secured. We've received your payment and your booth is ready for you."] }), _jsxs(Section, { children: [_jsxs(Text, { style: text, children: [_jsx("strong", { children: "Event:" }), " ", event] }), _jsxs(Text, { style: text, children: [_jsx("strong", { children: "Booth:" }), " ", booth] })] }), _jsx(Section, { style: buttonContainer, children: _jsx(Button, { href: url, style: button, children: "View Your Bookings here" }) }), _jsx(Hr, { style: hr }), _jsx(Text, { style: footer, children: "Please have this email or your digital receipt ready during load-in at the venue. If you have any questions, contact the event host directly through the dashboard." })] }) }) })] }));
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
//# sourceMappingURL=booking-confirmed.js.map