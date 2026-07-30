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

interface AdminInviteEmailProps {
  email: string;
  token: string;
}

export const AdminInviteEmail = ({ email, token }: AdminInviteEmailProps) => {
  const domain = process.env.FRONTEND_DOMAIN || 'http://localhost:5173';
  const url = `${domain}/admin-signup?token=${token}&email=${encodeURIComponent(email)}`;

  return (
    <Html>
      <Head />
      <Preview>Invitation to join BoothBnB Admin Team</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={h1}>Admin Invitation</Heading>
            <Text style={text}>
              You have been invited to join the **BoothBnB** administration team.
            </Text>
            <Text style={text}>
              To accept this invitation and set up your account, please click the button below:
            </Text>
            <Section style={buttonContainer}>
              <Button href={url} style={button}>
                Set Up Admin Account
              </Button>
            </Section>
            <Text style={footer}>
              This invitation link is intended for **{email}**. If you were not expecting this invitation, you can ignore this email.
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              For security reasons, this link will expire in 24 hours.
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