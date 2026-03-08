/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación - SistecPOS</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://yqvznnqcxvogxhramyua.supabase.co/storage/v1/object/public/email-assets/logo-sistecpos.png" width="160" height="40" alt="SistecPOS" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>Confirmar identidad</Heading>
        <Text style={text}>Usa el siguiente código para verificar tu identidad:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Este código expirará en breve. Si no lo solicitaste, puedes ignorar este correo.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '32px 28px', backgroundColor: '#ffffff', borderRadius: '8px', margin: '40px auto', maxWidth: '480px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(222, 47%, 11%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(215, 16%, 47%)', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: 'hsl(224, 76%, 40%)', margin: '0 0 30px', letterSpacing: '4px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', borderTop: '1px solid #eee', paddingTop: '16px' }
