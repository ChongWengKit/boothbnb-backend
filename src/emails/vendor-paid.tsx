import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';

interface VendorPaidNotificationEmailProps {
  hostName: string;
  vendorName: string;
  vendorEmail: string;
  eventName: string;
  boothName: string;
}

export const VendorPaidNotificationEmail = ({ hostName, vendorName, vendorEmail, eventName, boothName }: VendorPaidNotificationEmailProps) => {

  return (
    <Html>
      <Head />
      <Preview>New Payment Received: {vendorName} for {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>New Booking Payment</Heading>
            <Text style={text}>Hi **{hostName}**,</Text>
            <Text style={text}>
              Great news! **{vendorName}** has successfully paid for a booth at your event **{eventName}**.
            </Text>
            <Section>
              <Text style={text}><strong>Booth:</strong> {boothName}</Text>
              <Text style={text}><strong>Vendor Email:</strong> {vendorEmail}</Text>
            </Section>

            <Text style={footer}>
              Feel free to contact the vendor at **{vendorEmail}** to discuss the next steps for their setup.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              You can view booking details in your host dashboard.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
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
  textAlign: 'center' as const,
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
  textAlign: 'left' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
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