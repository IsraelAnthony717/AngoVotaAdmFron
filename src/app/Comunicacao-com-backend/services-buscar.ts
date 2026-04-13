import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client'
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ServicesBuscar {

  private socket: Socket;
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.socket = io(environment.apiUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    this.socket.on('connect', () => console.log('deu para usar o Socket'));
    this.socket.on('connect_error', (err) => console.log('Não deu', err));
  }

  // ============================================================
  // SOCKETS — Dados em tempo real
  // ============================================================

  mostrarEleitoresEmTemporeal(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('totais_Eleitores', (dados) => Observa.next(dados));
      return () => this.socket.off('totais_Eleitores');
    });
  }

  mostrarTotaisEleitorePorProvincia(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('totais_Eleitores_Por_Provincia', (dados) => Observa.next(dados));
      return () => this.socket.off('totais_Eleitores_Por_Provincia');
    });
  }

  mostrarGraficoFaixaEtariaEmTempoReal(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('resultadosPorFaixaEtaria', (dados) => Observa.next(dados));
      return () => this.socket.off('resultadosPorFaixaEtaria');
    });
  }

  mostrarGraficoPorGeneroEmTempoReal(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('resultadosPorGenero', (dados) => Observa.next(dados));
      return () => this.socket.off('resultadosPorGenero');
    });
  }

  mostrarGraficoPorHoraDeVoto(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('votoPorHora', (dados) => Observa.next(dados));
      return () => this.socket.off('votoPorHora');
    });
  }

  mostrarVotosAgrupados(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('resultadosAgrupados', (dados) => Observa.next(dados));
      return () => this.socket.off('resultadosAgrupados');
    });
  }

  mostrarGraficoDeProvincias(): Observable<any> {
    return new Observable((Observa) => {
      this.socket.on('resultadosProv', (dados) => Observa.next(dados));
      return () => this.socket.off('resultadosProv');
    });
  }

  // ============================================================
  // HTTP — Autenticação e perfil
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
  // HTTP — Estatísticas e gráficos
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

  buscarParticipacaoGlobal(): Observable<any> {
    return this.http.get(`${this.api}/cne/participacao-global`);
  }

  totaisEleitoresProvincias(body: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.api}/cne/MostrarEleitoresAgregados`, { body });
  }

  // ============================================================
  // HTTP — Candidatos
  // ============================================================

  // GET /candidato — Busca a lista de candidatos
  BuscarCandidatos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/candidato`, { withCredentials: true }).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.get<any[]>(`${this.api}/candidatos`, { withCredentials: true });
        }
        return throwError(() => erro);
      })
    );
  }

  // POST /candidato/criar — Cria um candidato com foto e fundo (multipart/form-data)
  // NÃO definir Content-Type — o browser adiciona o boundary automaticamente
  CriarCandidato(formData: FormData): Observable<any> {
  return this.http.post(`${this.api}/candidatos/criar`, formData, { withCredentials: true });
}

  // GET /candidatos/:id — Busca um candidato pelo ID
  BuscarCandidatoPorId(id: number): Observable<any> {
    return this.http.get(`${this.api}/candidatos/${id}`, { withCredentials: true }).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.get(`${this.api}/candidato/${id}`, { withCredentials: true });
        }
        return throwError(() => erro);
      })
    );
  }

  // PUT /candidatos/atualizar/:id — Atualiza um candidato com foto e fundo (multipart/form-data)
  AtualizarCandidato(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.api}/candidatos/atualizar/${id}`, formData, { withCredentials: true }).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.put(`${this.api}/candidato/atualizar/${id}`, formData, { withCredentials: true }).pipe(
            catchError((erro2) => {
              if (erro2.status === 404) {
                return this.http.put(`${this.api}/candidatos/${id}`, formData, { withCredentials: true }).pipe(
                  catchError((erro3) => {
                    if (erro3.status === 404) {
                      return this.http.put(`${this.api}/candidato/${id}`, formData, { withCredentials: true });
                    }
                    return throwError(() => erro3);
                  })
                );
              }
              return throwError(() => erro2);
            })
          );
        }
        return throwError(() => erro);
      })
    );
  }

  // DELETE /candidatos/:id — Remove um candidato pelo ID
  ApagarCandidato(id: number): Observable<any> {
    return this.http.delete(`${this.api}/candidatos/${id}`, { withCredentials: true }).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.delete(`${this.api}/candidato/${id}`, { withCredentials: true }).pipe(
            catchError((erro2) => {
              if (erro2.status === 404) {
                return this.http.delete(`${this.api}/candidatos/apagar/${id}`, { withCredentials: true }).pipe(
                  catchError((erro3) => {
                    if (erro3.status === 404) {
                      return this.http.delete(`${this.api}/candidato/apagar/${id}`, { withCredentials: true });
                    }
                    return throwError(() => erro3);
                  })
                );
              }
              return throwError(() => erro2);
            })
          );
        }
        return throwError(() => erro);
      })
    );
  }

  // ============================================================
  // HTTP — Votar
  // ============================================================

  // POST /votar — Regista o voto do eleitor autenticado
  Votar(candidato_id: number): Observable<any> {
    return this.http.post(`${this.api}/votar`, { candidato_id }, { withCredentials: true });
  }


   EnviarFile(ficheiro: File, face: 'frente' | 'verso') {

    const formData = new FormData();

    formData.append('imagem', ficheiro);
    formData.append('face', face);
    formData.append('utilizadorId', this.ObterIdDoUtilizador());
    return this.http.post(`${this.api}/analisar/imagem`, formData);
  }

  private ObterIdDoUtilizador(): string{

    let id = sessionStorage.getItem('utilizadorId');

    if(!id){

      id = Date.now().toString(); // Gera um ID temporário
      sessionStorage.setItem('utilizadorId', id);
    }
    return id
  }


  // ============================================================
// HTTP — Total de eleitores registados
// ============================================================
// services-buscar.ts
getTotalEleitoresRegistados(): Observable<{ total: number }> {
  return this.http.get<{ total: number }>(`${this.api}/cne/total-eleitores`, { withCredentials: true });
}







}
