import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Container, Head, Html, Preview, Section, Text, Heading, Hr, } from '@react-email/components';
export const VendorPaidNotificationEmail = ({ hostName, vendorName, vendorEmail, eventName, boothName }) => {
    return (_jsxs(Html, { children: [_jsx(Head, {}), _jsxs(Preview, { children: ["New Payment Received: ", vendorName, " for ", eventName] }), _jsx(Body, { style: main, children: _jsx(Container, { style: container, children: _jsxs(Section, { style: card, children: [_jsx(Heading, { style: h1, children: "New Booking Payment" }), _jsxs(Text, { style: text, children: ["Hi **", hostName, "**,"] }), _jsxs(Text, { style: text, children: ["Great news! **", vendorName, "** has successfully paid for a booth at your event **", eventName, "**."] }), _jsxs(Section, { children: [_jsxs(Text, { style: text, children: [_jsx("strong", { children: "Booth:" }), " ", boothName] }), _jsxs(Text, { style: text, children: [_jsx("strong", { children: "Vendor Email:" }), " ", vendorEmail] })] }), _jsxs(Text, { style: footer, children: ["Feel free to contact the vendor at **", vendorEmail, "** to discuss the next steps for their setup."] }), _jsx(Hr, { style: hr }), _jsx(Text, { style: footer, children: "You can view booking details in your host dashboard." })] }) }) })] }));
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
//# sourceMappingURL=vendor-paid.js.map