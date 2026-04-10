import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServiceEnviar } from '../service-enviar';
import { ServicesBuscar } from '../services-buscar'; // <-- adicione
import { Router } from '@angular/router';

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
  step: 'front' | 'back' = 'front';
  frontImage: string | null = null;
  backImage: string | null = null;
  statusMsg: string = "";
  validacaoFrente: any = null;
  validacaoVerso: any = null;
  enviando: boolean = false;

  constructor(
    private serviceEnviar: ServiceEnviar,
    public router: Router,
    private servicesBuscar: ServicesBuscar   // <-- injete
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imagemBase64 = canvas.toDataURL('image/png');

    if (this.step === 'front') {
      this.frontImage = imagemBase64;
      await this.validarImagem(imagemBase64, 'frente');
      if (this.validacaoFrente?.e_bi_Angolano && !this.validacaoFrente?.foto_copia) {
        this.step = 'back';
        this.statusMsg = '✅ Frente válida. Capture o verso.';
      } else {
        this.statusMsg = '❌ Frente inválida: ' + (this.validacaoFrente?.motivo || 'Documento não aceite');
      }
    } else {
      this.backImage = imagemBase64;
      await this.validarImagem(imagemBase64, 'verso');
      if (this.validacaoVerso?.e_bi_Angolano && !this.validacaoVerso?.foto_copia) {
        this.statusMsg = '✅ Documento completo e válido!';
        this.stopCamera();
      } else {
        this.statusMsg = '❌ Verso inválido: ' + (this.validacaoVerso?.motivo || 'Documento não aceite');
      }
    }
  }

  private async validarImagem(imagemBase64: string, lado: string) {
    this.enviando = true;
    this.statusMsg = `Validando ${lado}...`;
    try {
      const resultado = await this.servicesBuscar.validarBIComImagem(imagemBase64).toPromise();
      if (lado === 'frente') this.validacaoFrente = resultado;
      else this.validacaoVerso = resultado;
      this.statusMsg = `${lado}: ${resultado?.e_bi_Angolano ? 'Aceito' : 'Rejeitado'}`;
    } catch (err) {
      console.error(err);
      this.statusMsg = `Erro ao validar ${lado}.`;
    } finally {
      this.enviando = false;
    }
  }

  stopCamera() {
    this.stream?.getTracks().forEach(track => track.stop());
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  confirmarEnvio() {
    if (this.validacaoFrente?.e_bi_Angolano && this.validacaoVerso?.e_bi_Angolano &&
        !this.validacaoFrente?.foto_copia && !this.validacaoVerso?.foto_copia) {
      const numeroBI = this.validacaoFrente.numero_bi || this.validacaoVerso.numero_bi;
      this.serviceEnviar.DadosEnviados(numeroBI);
      this.router.navigate(['/reconhecimento']);
    } else {
      alert('Documento não validado pela IA. Capture novamente.');
    }
  }
}
