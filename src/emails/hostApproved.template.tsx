import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Heading,
} from '@react-email/components';

interface HostApprovedProps {
  username: string;
}

export const HostApproved = ({ username }: HostApprovedProps) => {
  return (
    <Html>
      <Head />
      <Preview>You are approved!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>You are approved!</Heading>
            <Text style={text}>Hi **{username}**,</Text>
            <Text style={text}>
              You are now an approved host. You can start hosting events and taking bookings.
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
