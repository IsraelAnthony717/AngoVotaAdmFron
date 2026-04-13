import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-painel-candidato',
  templateUrl: './painel-candidato.html',
  styleUrls: ['./painel-candidato.css']
})

export class PainelCandidato implements OnInit {
  totalPartidos: number = 0;  // Mude para number
  totalCandidatos: number = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Buscar total de candidatos
    this.http.get(`${environment.apiUrl}/candidatos/total`).pipe(
      catchError((erro) => {
        console.error('Erro ao buscar total:', erro);
        return throwError(() => erro);
      })
    ).subscribe({
      next: (resposta: any) => {
        console.log('Total de candidatos:', resposta);
        this.totalCandidatos = resposta.total;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        console.error('Erro:', erro);
        this.totalCandidatos = 0;
      }
    });

    // Buscar total de partidos (se tiver um endpoint específico)
    // Por enquanto, vamos contar partidos únicos dos candidatos
    this.http.get(`${environment.apiUrl}/candidatos`).pipe(
      catchError((erro) => {
        console.error('Erro ao buscar candidatos:', erro);
        return throwError(() => erro);
      })
    ).subscribe({
      next: (resposta: any) => {
        if (resposta && Array.isArray(resposta)) {
          // Contar partidos únicos
          const partidosUnicos = new Set(resposta.map((c: any) => c.partido));
          this.totalPartidos = partidosUnicos.size;
          console.log('Total de partidos:', this.totalPartidos);
          this.cdr.detectChanges();
        }
      },
      error: (erro) => {
        console.error('Erro:', erro);
        this.totalPartidos = 0;
      }
    });
  }
}