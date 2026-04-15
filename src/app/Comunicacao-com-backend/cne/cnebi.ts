// cnebi.ts
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServiceEnviar } from '../service-enviar';
import { Router } from '@angular/router';
import { ServicesBuscar } from '../services-buscar';

type Step = 'front' | 'back';
type Status = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-cnebi',
  imports: [CommonModule],
  templateUrl: './cnebi.html',
  styleUrl: './cnebi.css',
})
export class Cnebi implements AfterViewInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  stream!: MediaStream;
  step: Step = 'front';
  frontImage: string | null = null;
  backImage: string | null = null;

  frontStatus: Status = 'idle';
  backStatus: Status = 'idle';
  frontMensagem: string = '';
  backMensagem: string = '';

  frenteAprovada: boolean = false;

  // Variáveis para exibir erros na tela
  erroGlobal: string | null = null;
  logsSistema: string[] = [];  // histórico de eventos (opcional)

  constructor(
    private serviceEnviar: ServiceEnviar,
    private rota: Router,
    private serviceBuscar: ServicesBuscar
  ) {
    this.adicionarLog('Componente inicializado');
  }

  private adicionarLog(mensagem: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logsSistema.unshift(`[${timestamp}] ${mensagem}`);
    // manter apenas os últimos 10 logs para não sobrecarregar a tela
    if (this.logsSistema.length > 10) this.logsSistema.pop();
  }

  private mostrarErro(mensagem: string) {
    this.erroGlobal = mensagem;
    this.adicionarLog(`ERRO: ${mensagem}`);
    // Limpa o erro após 5 segundos
    setTimeout(() => {
      if (this.erroGlobal === mensagem) this.erroGlobal = null;
    }, 5000);
  }

  async ngAfterViewInit() {
    this.adicionarLog('A solicitar acesso à câmara...');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      this.adicionarLog('Câmara obtida com sucesso');
      this.video.nativeElement.srcObject = this.stream;
    } catch (err: any) {
      console.error(err);
      let mensagem = 'Não foi possível aceder à câmara. ';
      if (err.name === 'NotAllowedError') {
        mensagem += 'Permissão negada. Verifique as configurações do telemóvel.';
      } else if (err.name === 'NotFoundError') {
        mensagem += 'Nenhuma câmara encontrada neste dispositivo.';
      } else {
        mensagem += err.message || 'Erro desconhecido.';
      }
      this.mostrarErro(mensagem);
    }
  }

  capture() {
    if (this.step === 'back' && !this.frenteAprovada) {
      this.mostrarErro('Complete a frente do BI antes de capturar o verso.');
      this.backStatus = 'error';
      this.backMensagem = 'Complete a frente primeiro.';
      return;
    }

    const video = this.video.nativeElement;
    const canvas = this.canvas.nativeElement;

    if (!video.videoWidth || !video.videoHeight) {
      this.mostrarErro('A câmara ainda não está pronta. Aguarde um instante e tente novamente.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.mostrarErro('Erro interno ao processar a imagem (contexto 2D não disponível).');
      return;
    }
    ctx.drawImage(video, 0, 0);
    this.adicionarLog('Imagem capturada no canvas');

    if (this.step === 'front') {
      this.frontImage = canvas.toDataURL('image/jpeg');
      this.frontStatus = 'loading';
      this.frontMensagem = 'A verificar documento...';

      canvas.toBlob(blob => {
        if (!blob) {
          this.mostrarErro('Falha ao gerar a imagem da frente. Tente novamente.');
          this.frontStatus = 'error';
          this.frontMensagem = 'Erro ao processar imagem.';
          this.frontImage = null;
          this.frenteAprovada = false;
          return;
        }
        const ficheiro = new File([blob], 'bi-frente.jpg', { type: 'image/jpeg' });
        this.adicionarLog(`Enviando frente (${ficheiro.size} bytes)...`);

        this.serviceBuscar.EnviarFile(ficheiro, 'frente').subscribe({
          next: (res: any) => {
            this.adicionarLog('Resposta da API (frente) recebida');
            if (!res.e_bi_Angolano || !res.e_original) {
              const motivo = res.motivo || 'Documento inválido ou não angolano.';
              this.mostrarErro(`Frente rejeitada: ${motivo}`);
              this.frontStatus = 'error';
              this.frontMensagem = motivo;
              this.frontImage = null;
              this.frenteAprovada = false;
              return;
            }
            this.frontStatus = 'success';
            this.frontMensagem = 'Frente verificada com sucesso!';
            this.frenteAprovada = true;
            this.step = 'back';
            this.adicionarLog('Frente aprovada. Agora pode capturar o verso.');
          },
          error: (err: any) => {
            const erroMsg = err?.error?.erro || err?.message || 'Erro ao comunicar com o servidor.';
            this.mostrarErro(`Erro no envio da frente: ${erroMsg}`);
            this.frontStatus = 'error';
            this.frontMensagem = erroMsg;
            this.frontImage = null;
            this.frenteAprovada = false;
          }
        });
      }, 'image/jpeg');

    } else { // verso
      this.backImage = canvas.toDataURL('image/jpeg');
      this.backStatus = 'loading';
      this.backMensagem = 'A verificar verso...';

      canvas.toBlob(blob => {
        if (!blob) {
          this.mostrarErro('Falha ao gerar a imagem do verso.');
          this.backStatus = 'error';
          this.backMensagem = 'Erro ao processar imagem.';
          this.backImage = null;
          return;
        }
        const ficheiro = new File([blob], 'bi-verso.jpg', { type: 'image/jpeg' });
        this.adicionarLog(`Enviando verso (${ficheiro.size} bytes)...`);

        this.serviceBuscar.EnviarFile(ficheiro, 'verso').subscribe({
          next: (res: any) => {
            this.adicionarLog('Resposta da API (verso) recebida');
            if (!res.e_bi_Angolano || !res.e_original) {
              const motivo = res.motivo || 'Verso inválido.';
              this.mostrarErro(`Verso rejeitado: ${motivo}`);
              this.backStatus = 'error';
              this.backMensagem = motivo;
              this.backImage = null;
              return;
            }
            this.backStatus = 'success';
            this.backMensagem = 'Verso verificado com sucesso!';
            this.adicionarLog('Documento completamente validado. A redirecionar...');

            if (this.frontImage) {
              this.serviceEnviar.DadosEnviados(this.frontImage);
            }

            setTimeout(() => {
              this.stopCamera();
              this.rota.navigate(['/reconhecimento']);
            }, 1500);
          },
          error: (err: any) => {
            const erroMsg = err?.error?.erro || err?.message || 'Erro ao verificar o verso.';
            this.mostrarErro(`Erro no envio do verso: ${erroMsg}`);
            this.backStatus = 'error';
            this.backMensagem = erroMsg;
            this.backImage = null;
          }
        });
      }, 'image/jpeg');
    }
  }

  recapturar(fase: 'front' | 'back') {
    this.adicionarLog(`Recapturar solicitado para ${fase}`);
    if (fase === 'front') {
      this.frontImage = null;
      this.frontStatus = 'idle';
      this.frontMensagem = '';
      this.frenteAprovada = false;
      this.step = 'front';
      this.backImage = null;
      this.backStatus = 'idle';
      this.backMensagem = '';
      this.erroGlobal = null;
    } else {
      this.backImage = null;
      this.backStatus = 'idle';
      this.backMensagem = '';
      this.step = 'back';
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.adicionarLog('Câmara desligada.');
    }
  }

  ngOnDestroy() {
    this.stopCamera();
  }
}
