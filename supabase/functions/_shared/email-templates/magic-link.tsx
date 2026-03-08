/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu enlace de acceso a SistecPOS</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://yqvznnqcxvogxhramyua.supabase.co/storage/v1/object/public/email-assets/logo-sistecpos.png" width="160" height="40" alt="SistecPOS" style={{ marginBottom: '24px' }} />
        <Heading style={h1}>Tu enlace de acceso</Heading>
        <Text style={text}>
          Haz clic en el botón para iniciar sesión en SistecPOS. Este enlace expirará en breve.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Iniciar sesión
        </Button>
        <Text style={footer}>
          Si no solicitaste este enlace, puedes ignorar este correo de forma segura.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', Arial, sans-serif" }
const container = { padding: '32px 28px', backgroundColor: '#ffffff', borderRadius: '8px', margin: '40px auto', maxWidth: '480px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: 'hsl(222, 47%, 11%)', margin: '0 0 20px' }
const text = { fontSize: '14px', color: 'hsl(215, 16%, 47%)', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: 'hsl(224, 76%, 40%)', color: '#f5f7fa', fontSize: '14px', fontWeight: 'bold' as const, borderRadius: '8px', padding: '12px 24px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', borderTop: '1px solid #eee', paddingTop: '16px' }
