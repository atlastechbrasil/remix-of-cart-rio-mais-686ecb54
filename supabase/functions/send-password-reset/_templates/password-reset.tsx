import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Img,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail: string;
}

export const PasswordResetEmail = ({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Redefinição de senha - FinCart</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Heading style={logoText}>FinCart</Heading>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Redefinição de Senha</Heading>
          
          <Text style={text}>
            Olá,
          </Text>
          
          <Text style={text}>
            Recebemos uma solicitação para redefinir a senha da conta associada ao email{' '}
            <strong>{userEmail}</strong>.
          </Text>

          <Text style={text}>
            Clique no botão abaixo para criar uma nova senha:
          </Text>

          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              Redefinir Senha
            </Link>
          </Section>

          <Text style={textSmall}>
            Ou copie e cole este link no seu navegador:
          </Text>
          
          <Text style={linkText}>
            {resetUrl}
          </Text>

          <Hr style={hr} />

          <Text style={textMuted}>
            Se você não solicitou esta redefinição de senha, pode ignorar este email com segurança.
            Sua senha permanecerá inalterada.
          </Text>

          <Text style={textMuted}>
            Este link expirará em 1 hora por motivos de segurança.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} FinCart - Sistema de Conciliação Bancária para Cartórios
          </Text>
          <Text style={footerText}>
            Este é um email automático, não responda.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

// Styles
const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#1e3a5f',
  padding: '32px 24px',
  borderRadius: '8px 8px 0 0',
  textAlign: 'center' as const,
}

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '-0.5px',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px 24px',
}

const h1 = {
  color: '#1e3a5f',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
}

const textSmall = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 8px 0',
  textAlign: 'center' as const,
}

const textMuted = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
}

const linkText = {
  color: '#3b82f6',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 16px 0',
  wordBreak: 'break-all' as const,
  textAlign: 'center' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '24px',
  borderRadius: '0 0 8px 8px',
  borderTop: '1px solid #e5e7eb',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 4px 0',
}
