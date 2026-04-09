import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServiceEnviar } from '../service-enviar';
import { ServicesBuscar } from '../services-buscar';
import { Router } from '@angular/router';

type Step = 'front' | 'back';

@Component({
  selector: 'app-cnebi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cnebi.html',
  styleUrls: ['./cnebi.css']
})
export class Cnebi implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  stream!: MediaStream;
  step: Step = 'front';
  frontImage: string | null = null;
  backImage: string | null = null;
  statusMsg: string = "";

  validacaoFrente: any = null;
  validacaoVerso: any = null;
  enviando: boolean = false;

  // Torna o router público para uso no template
  constructor(
    private serviceEnviar: ServiceEnviar,
    public router: Router,          // <- alterado para public
    private servicesBuscar: ServicesBuscar
  ) {}

  async ngAfterViewInit() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
    this.video.nativeElement.srcObject = this.stream;
  }

  async capture() {
    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imagemBase64 = canvas.toDataURL('image/png');

    if (this.step === 'front') {
      this.frontImage = imagemBase64;
      const validoLocal = this.verificarDocumento(imageData, canvas.width, canvas.height);
      if (!validoLocal) {
        this.statusMsg = "⚠️ Frente suspeita (validação local)";
      }
      await this.validarImagem(imagemBase64, 'frente');
      if (this.validacaoFrente?.e_bi_Angolano && !this.validacaoFrente?.foto_copia) {
        this.step = 'back';
        this.statusMsg = "✅ Frente válida pela IA. Agora capture o verso.";
      } else {
        this.statusMsg = "❌ Frente inválida: " + (this.validacaoFrente?.motivo || 'Documento não aceite');
      }
    } else {
      this.backImage = imagemBase64;
      await this.validarImagem(imagemBase64, 'verso');
      if (this.validacaoVerso?.e_bi_Angolano && !this.validacaoVerso?.foto_copia) {
        this.statusMsg = "✅ Documento completo e válido! Pode confirmar o envio.";
        this.stopCamera();
      } else {
        this.statusMsg = "❌ Verso inválido: " + (this.validacaoVerso?.motivo || 'Documento não aceite');
      }
    }
  }

  private async validarImagem(imagemBase64: string, lado: string) {
    this.enviando = true;
    this.statusMsg = `Validando ${lado} com IA...`;
    try {
      const resultado = await this.servicesBuscar.validarBIComImagem(imagemBase64).toPromise();
      if (lado === 'frente') {
        this.validacaoFrente = resultado;
      } else {
        this.validacaoVerso = resultado;
      }
      this.statusMsg = `${lado} validado: ${resultado?.e_bi_Angolano ? 'Aceito' : 'Rejeitado'}`;
    } catch (erro) {
      console.error(erro);
      this.statusMsg = `Erro ao validar ${lado}. Tente novamente.`;
    } finally {
      this.enviando = false;
    }
  }

  private verificarDocumento(imageData: ImageData, width: number, height: number): boolean {
    let min = 255, max = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const brilho = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
      if (brilho < min) min = brilho;
      if (brilho > max) max = brilho;
    }
    const contraste = max - min;
    const contrasteOk = contraste > 20;
    const proporcao = width / height;
    const proporcaoOk = proporcao > 1.3 && proporcao < 1.8;
    let bordas = 0;
    for (let i = 0; i < imageData.data.length - 4; i += 4) {
      const brilho1 = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
      const brilho2 = (imageData.data[i+4] + imageData.data[i+5] + imageData.data[i+6]) / 3;
      if (Math.abs(brilho1 - brilho2) > 40) bordas++;
    }
    const bordasOk = bordas > (width * height * 0.005);
    return contrasteOk && proporcaoOk && bordasOk;
  }

  stopCamera() {
    this.stream?.getTracks().forEach(track => track.stop());
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  confirmarEnvio() {
    if (this.validacaoFrente?.e_bi_Angolano && !this.validacaoFrente?.foto_copia &&
        this.validacaoVerso?.e_bi_Angolano && !this.validacaoVerso?.foto_copia) {
      const numeroBI = this.validacaoFrente.numero_bi || this.validacaoVerso.numero_bi;
      this.serviceEnviar.DadosEnviados(numeroBI);
      this.router.navigate(['/reconhecimento']);
    } else {
      alert('Documento não validado pela IA. Capture novamente as imagens.');
    }
  }
}
