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

interface ResetPasswordEmailProps {
  username: string;
  token: string;
}

export const ResetPasswordEmail = ({ username, token }: ResetPasswordEmailProps) => {
  const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
  const url = `${domain}/reset-password?token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>Reset your password</Heading>
            <Text style={text}>Hi **{username}**,</Text>
            <Text style={text}>
              We received a request to reset the password for your account. 
              Click the button below to choose a new one.
            </Text>
            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Reset Password
              </Button>
            </Section>
            <Text style={text}>
              **Note:** This link will expire in 1 hour for security reasons. 
              If you did not request a password reset, please ignore this email or contact support if you have concerns.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              For your security, never share this link with anyone. 
              Our team will never ask for your password over email.
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
  lineHeight: '22px',
  textAlign: 'left' as const,
};