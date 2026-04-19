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
interface BookingConfirmedProps {
  username: string;
  event: string;
  booth: string;
  bookingId: number;
}
export const BookingConfirmedEmail = ({ username, event, booth, bookingId }: BookingConfirmedProps) => {
  const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
  const url = `${domain}/booking/${bookingId}`;

  return (
    <Html>
      <Head />
      <Preview>Booking Confirmed: {event}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>Booking Confirmed!</Heading>
            <Text style={text}>Hi **{username}**,</Text>
            <Text style={text}>
              Your spot at **{event}** is officially secured. We've received your payment and your booth is ready for you.
            </Text>

            {/* Booking Details Box */}
            <Section>
              <Text style={text}><strong>Event:</strong> {event}</Text>
              <Text style={text}><strong>Booth:</strong> {booth}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                View Your Bookings here
              </Button>
            </Section>

            <Hr style={hr} />
            <Text style={footer}>
              Please have this email or your digital receipt ready during load-in at the venue. 
              If you have any questions, contact the event host directly through the dashboard.
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