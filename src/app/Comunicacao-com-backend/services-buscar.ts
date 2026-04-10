import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesBuscar {

  private socket: Socket;
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    this.socket.on('connect', () => console.log('Socket conectado'));
    this.socket.on('connect_error', (err) => console.log('Erro socket:', err));
  }

  // ============================================================
  // SOCKETS
  // ============================================================
  mostrarEleitoresEmTemporeal(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('totais_Eleitores', (dados) => obs.next(dados));
      return () => this.socket.off('totais_Eleitores');
    });
  }

  mostrarTotaisEleitorePorProvincia(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('totais_Eleitores_Por_Provincia', (dados) => obs.next(dados));
      return () => this.socket.off('totais_Eleitores_Por_Provincia');
    });
  }

  mostrarGraficoFaixaEtariaEmTempoReal(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('resultadosPorFaixaEtaria', (dados) => obs.next(dados));
      return () => this.socket.off('resultadosPorFaixaEtaria');
    });
  }

  mostrarGraficoPorGeneroEmTempoReal(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('resultadosPorGenero', (dados) => obs.next(dados));
      return () => this.socket.off('resultadosPorGenero');
    });
  }

  mostrarGraficoPorHoraDeVoto(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('votoPorHora', (dados) => obs.next(dados));
      return () => this.socket.off('votoPorHora');
    });
  }

  mostrarVotosAgrupados(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('resultadosAgrupados', (dados) => obs.next(dados));
      return () => this.socket.off('resultadosAgrupados');
    });
  }

  mostrarGraficoDeProvincias(): Observable<any> {
    return new Observable((obs) => {
      this.socket.on('resultadosProv', (dados) => obs.next(dados));
      return () => this.socket.off('resultadosProv');
    });
  }

  // ============================================================
  // HTTP – Autenticação
  // ============================================================
  enviarBI(numeroBI: string): Observable<any> {
    return this.http.post(`${this.api}/cne/auth`, { numeroBI }, { withCredentials: true });
  }

  enviarKYC(kyc: boolean): Observable<any> {
    return this.http.post(`${this.api}/cne/validarKYC`, { ativo: kyc }, { withCredentials: true });
  }

  mostrarPerfil(): Observable<any> {
    return this.http.get(`${this.api}/criarUsuario`, { withCredentials: true });
  }

  // ============================================================
  // HTTP – Estatísticas
  // ============================================================
  getParticipacaoFaixaEtaria(): Observable<any> {
    return this.http.get(`${this.api}/cne/MostrarEleitoresPorFaixaEtaria`);
  }

  getVotosPorHora(): Observable<any> {
    return this.http.get(`${this.api}/cne/votos/hora`);
  }

  getVotosPorGenero(): Observable<any> {
    return this.http.get(`${this.api}/cne/MostrarEleitoresPorGenero`);
  }

  getParticipacaoPorProvincia(): Observable<any> {
    return this.http.get(`${this.api}/votos/provincia/contagem`);
  }

  totaisEleitoresProvincias(body: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.api}/cne/MostrarEleitoresAgregados`, { body });
  }

  // ============================================================
  // HTTP – Candidatos
  // ============================================================
  BuscarCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/candidatos`, { withCredentials: true });
  }

  CriarCandidato(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/candidatos/criar`, formData, { withCredentials: true });
  }

  ApagarCandidato(id: number): Observable<any> {
    return this.http.delete(`${this.api}/candidatos/apagar/${id}`, { withCredentials: true });
  }

  // ============================================================
  // HTTP – Votar
  // ============================================================
  Votar(candidato_id: number): Observable<any> {
    return this.http.post(`${this.api}/votar`, { candidato_id }, { withCredentials: true });
  }

  // ============================================================
  // VALIDAÇÃO DE BI COM IA (MISTRAL)
  // ============================================================
  validarBIComImagem(imagemBase64: string): Observable<any> {
    const blob = this.base64ToBlob(imagemBase64);
    const formData = new FormData();
    formData.append('imagem', blob, 'bi.jpg');
    return this.http.post(`${this.api}/validar-bi`, formData, { withCredentials: true });
  }

  private base64ToBlob(base64: string): Blob {
    const partes = base64.split(',');
    const tipoMime = partes[0].match(/:(.*?);/)?.[1] || 'image/png';
    const byteString = atob(partes[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: tipoMime });
  }
}
