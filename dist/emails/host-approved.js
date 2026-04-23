import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Container, Head, Html, Preview, Section, Text, Heading, } from '@react-email/components';
export const HostApproved = ({ username }) => {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsx(Preview, { children: "You are approved!" }), _jsx(Body, { style: main, children: _jsx(Container, { style: container, children: _jsxs(Section, { style: card, children: [_jsx(Heading, { style: h1, children: "You are approved!" }), _jsxs(Text, { style: text, children: ["Hi **", username, "**,"] }), _jsx(Text, { style: text, children: "You are now an approved host. You can start hosting events and taking bookings." })] }) }) })] }));
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
//# sourceMappingURL=host-approved.js.map