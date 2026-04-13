import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {  ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-perfil-candidato',
  imports: [CommonModule, ],
  templateUrl: './perfil-candidato.html',
  styleUrl: './perfil-candidato.css',
})
export class PerfilCandidato  implements OnInit{
  totalCandidatos: number = 0;
  candidatos: any[] = [];
  carregando: boolean = true;
  erro: string = '';

  candidatosMockados = [
    {
      id: 1,
      numero: 1,
      nome: 'João Silva',
      partido: 'Partido A',
      idade: 45,
      foto_url: 'https://via.placeholder.com/300x400?text=João+Silva',
      slogan: 'Mudança para o futuro',
      descricao: 'Candidato com experiência em gestão pública',
      backgroundurl: 'https://via.placeholder.com/1200x400?text=João+Silva',
      criando_em: new Date()
    },
    {
      id: 2,
      numero: 2,
      nome: 'Maria Santos',
      partido: 'Partido B',
      idade: 38,
      foto_url: 'https://via.placeholder.com/300x400?text=Maria+Santos',
      slogan: 'Por um país melhor',
      descricao: 'Defensora dos direitos sociais',
      backgroundurl: 'https://via.placeholder.com/1200x400?text=Maria+Santos',
      criando_em: new Date()
    }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.buscarCandidatos();
  }

  buscarCandidatos() {
    this.carregando = true;
    this.erro = '';
    console.log('🔵 Iniciando busca de candidatos...');

    this.http.get(`${environment.apiUrl}/candidato/total`).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.get(`${environment.apiUrl}/candidatos/total`);
        }
        return throwError(() => erro);
      })
    ).subscribe({
        next: (resposta: any) => {
          console.log('✅ Total de candidatos:', resposta.total);
          this.totalCandidatos = resposta.total;
          this.cdr.detectChanges();
        },
        error: (erro) => {
          console.error('❌ Erro no total:', erro);
          this.totalCandidatos = this.candidatos.length || this.candidatosMockados.length;
        }
      });

    this.http.get(`${environment.apiUrl}/candidato`).pipe(
      catchError((erro) => {
        if (erro.status === 404) {
          return this.http.get(`${environment.apiUrl}/candidatos`);
        }
        return throwError(() => erro);
      })
    ).subscribe({
        next: (resposta: any) => {
          console.log('✅ Candidatos recebidos:', resposta);
          
          if (resposta && Array.isArray(resposta) && resposta.length > 0) {
            // Adicionar idade padrão se não existir (para compatibilidade)
            this.candidatos = resposta.map(c => ({
              ...c,
              idade: c.idade || 0
            }));
            console.log('✅ ' + resposta.length + ' candidatos carregados');
          } else {
            console.warn('⚠️ Nenhum candidato no banco. Usando dados mockados.');
            this.candidatos = this.candidatosMockados;
            this.erro = 'Exibindo dados de teste (mockados)';
          }
          
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (erro: any) => {
          console.error('❌ Erro ao buscar candidatos:', erro);
          console.error('Status:', erro.status);
          console.error('Mensagem do erro:', erro.error?.error || erro.message);
          console.warn('⚠️ Usando dados mockados como fallback');
          this.candidatos = this.candidatosMockados;
          this.erro = `Erro ${erro.status}: ${erro.error?.error || erro.statusText}`;
          this.carregando = false;
          this.cdr.detectChanges();
        }
      });
  }
}