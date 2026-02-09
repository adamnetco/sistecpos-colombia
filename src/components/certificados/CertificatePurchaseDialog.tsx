import { useState } from "react";
import { WompiCheckoutButton } from "@/components/payments/WompiCheckoutButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "1_year" | "2_years";
  priceCop: number;
}

interface FileState {
  file: File | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
}

const initialFileState: FileState = { file: null, uploading: false, url: null, error: null };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return "El archivo no puede superar 10MB";
  if (!ALLOWED_TYPES.includes(file.type)) return "Solo se aceptan PDF, JPG, PNG o WEBP";
  return null;
}

export function CertificatePurchaseDialog({ open, onOpenChange, plan, priceCop }: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [nit, setNit] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [rutFile, setRutFile] = useState<FileState>(initialFileState);
  const [camaraFile, setCamaraFile] = useState<FileState>(initialFileState);
  const [cedulaFile, setCedulaFile] = useState<FileState>(initialFileState);
  const [soporteFile, setSoporteFile] = useState<FileState>(initialFileState);

  const planLabel = plan === "2_years" ? "2 Años" : "1 Año";
  const priceFormatted = priceCop.toLocaleString("es-CO");

  async function uploadFile(
    file: File,
    folder: string,
    setState: React.Dispatch<React.SetStateAction<FileState>>
  ): Promise<string | null> {
    const error = validateFile(file);
    if (error) {
      setState({ file, uploading: false, url: null, error });
      return null;
    }

    setState({ file, uploading: true, url: null, error: null });
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("certificate-docs")
      .upload(path, file);

    if (uploadError) {
      setState({ file, uploading: false, url: null, error: "Error al subir el archivo" });
      return null;
    }

    setState({ file, uploading: false, url: path, error: null });
    return path;
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    folder: string,
    setState: React.Dispatch<React.SetStateAction<FileState>>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, folder, setState);
  }

  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim() || !nit.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }

    if (!rutFile.url || !camaraFile.url || !cedulaFile.url) {
      toast({ title: "Adjunta los documentos requeridos (RUT, Cámara de Comercio, Cédula)", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase.from("certificate_orders").insert({
      full_name: fullName.trim(),
      nit: nit.trim(),
      email: email.trim(),
      phone: phone.trim(),
      plan,
      price_cop: priceCop,
      rut_url: rutFile.url,
      camara_comercio_url: camaraFile.url,
      cedula_url: cedulaFile.url,
      soporte_pago_url: soporteFile.url ?? null,
    }).select("id").single();

    setSubmitting(false);

    if (error || !data) {
      toast({ title: "Error al enviar la solicitud", description: "Intenta nuevamente", variant: "destructive" });
      return;
    }

    // Send WhatsApp notification to sales team (fire-and-forget)
    supabase.functions.invoke("notify-certificate-order", {
      body: {
        full_name: fullName.trim(),
        nit: nit.trim(),
        email: email.trim(),
        phone: phone.trim(),
        plan,
        price_cop: priceCop,
      },
    }).then(({ error: notifError }) => {
      if (notifError) console.error("WhatsApp notification failed:", notifError);
    });

    setOrderId(data.id);
    setShowPayment(true);
  }

  function handleClose() {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSuccess(false);
      setFullName("");
      setNit("");
      setEmail("");
      setPhone("");
      setRutFile(initialFileState);
      setCamaraFile(initialFileState);
      setCedulaFile(initialFileState);
      setSoporteFile(initialFileState);
    }, 300);
  }

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-whatsapp mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">¡Solicitud Enviada!</h3>
            <p className="text-muted-foreground mb-4">
              Hemos recibido tu solicitud de certificado digital ({planLabel} - ${priceFormatted} COP).
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Te contactaremos por WhatsApp al <strong>{phone}</strong> para confirmar tu pedido.
            </p>
            <Button onClick={handleClose} className="btn-whatsapp">
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showPayment && orderId) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar Certificado Digital — {planLabel}</DialogTitle>
            <DialogDescription>
              Solicitud creada. Ahora puedes pagar en línea de forma segura con Wompi.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4 space-y-4">
            <p className="text-2xl font-bold text-primary">${priceFormatted} COP</p>
            <WompiCheckoutButton
              amountCents={priceCop * 100}
              customerEmail={email}
              customerName={fullName}
              customerPhone={phone}
              certificateOrderId={orderId}
              onSuccess={() => setSuccess(true)}
              className="w-full"
            />
            <Button variant="ghost" size="sm" onClick={() => setSuccess(true)} className="text-muted-foreground">
              Pagar después por transferencia
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comprar Certificado Digital — {planLabel}</DialogTitle>
          <DialogDescription>
            Precio: <strong>${priceFormatted} COP</strong>. Completa el formulario y adjunta los documentos requeridos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Contact info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cert-name">Nombre completo / Razón social *</Label>
              <Input id="cert-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="SistecPOS S.A.S." required maxLength={200} />
            </div>
            <div>
              <Label htmlFor="cert-nit">NIT o Cédula *</Label>
              <Input id="cert-nit" value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900123456-7" required maxLength={20} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cert-email">Correo electrónico *</Label>
              <Input id="cert-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@empresa.com" required maxLength={255} />
            </div>
            <div>
              <Label htmlFor="cert-phone">WhatsApp *</Label>
              <Input id="cert-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3176268307" required maxLength={15} />
            </div>
          </div>

          {/* File uploads */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Documentos requeridos</h4>
            <p className="text-xs text-muted-foreground">Formato: PDF, JPG o PNG. Máximo 10MB por archivo.</p>

            <FileUploadField
              label="RUT actualizado *"
              id="cert-rut"
              state={rutFile}
              onChange={(e) => handleFileChange(e, "rut", setRutFile)}
            />
            <FileUploadField
              label="Cámara de Comercio *"
              id="cert-camara"
              state={camaraFile}
              onChange={(e) => handleFileChange(e, "camara-comercio", setCamaraFile)}
            />
            <FileUploadField
              label="Copia Cédula Representante Legal *"
              id="cert-cedula"
              state={cedulaFile}
              onChange={(e) => handleFileChange(e, "cedula", setCedulaFile)}
            />
            <FileUploadField
              label="Soporte de Pago (opcional)"
              id="cert-soporte"
              state={soporteFile}
              onChange={(e) => handleFileChange(e, "soporte-pago", setSoporteFile)}
              optional
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p>
              Al enviar este formulario aceptas nuestra{" "}
              <a href="/politica-privacidad" target="_blank" className="text-primary underline">
                política de tratamiento de datos
              </a>
              . Te contactaremos por WhatsApp con los datos de pago por transferencia bancaria.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={submitting || rutFile.uploading || camaraFile.uploading || cedulaFile.uploading || soporteFile.uploading}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              `Enviar Solicitud — $${priceFormatted} COP`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FileUploadField({
  label,
  id,
  state,
  onChange,
  optional,
}: {
  label: string;
  id: string;
  state: FileState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <label
          htmlFor={id}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed cursor-pointer hover:bg-muted/50 transition-colors text-sm flex-1"
        >
          {state.uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : state.url ? (
            <CheckCircle2 className="h-4 w-4 text-whatsapp" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="truncate text-muted-foreground">
            {state.file?.name ?? (optional ? "Seleccionar archivo (opcional)" : "Seleccionar archivo")}
          </span>
        </label>
        <input
          id={id}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={onChange}
        />
        {state.url && (
          <Badge variant="secondary" className="text-xs shrink-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Subido
          </Badge>
        )}
      </div>
      {state.error && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {state.error}
        </p>
      )}
    </div>
  );
}
